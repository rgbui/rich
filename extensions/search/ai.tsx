import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { channel } from "../../net/channel";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { util } from "../../util/util";
import { marked } from "marked";
import { AskTemplate, getTemplateInstance } from "../ai/prompt";
import { Divider } from "../../component/view/grid";
import { isMobileOnly } from "react-device-detect";
import { lst } from "../../i18n/store";
import { LinkPageItem, LinkWs, getPageIcon, getPageText } from "../../src/page/declare";
import { Icon } from "../../component/view/icon";
import { AiStartSvg, DuplicateSvg, PublishSvg, RefreshSvg } from "../../component/svgs";
import { S } from "../../i18n/view";
import { getWsContext } from "../../net/ai/robot";
import { CopyAlert } from "../../component/copy";
import { getAiDefaultModel } from "../../net/ai/cost";
import { ToolTip } from "../../component/view/tooltip";
import { DivInput } from "../../component/view/input/div";
import { Button } from "../../component/view/button";
const AI_SEARCH_MESSAGES = 'AI_SEARCH_MESSAGES';
import "./style.less";

export class AISearchBox extends EventsComponent {
    messages: { id: string, userid?: string, asking?: boolean, prompt?: string, date: Date, content: string, refs?: { blockIds: string[], page: LinkPageItem, elementUrl: string }[] }[] = [];
    renderMessages() {
        return this.messages.map(msg => {
            return <div data-ai-message={msg.id} key={msg.id}>

                {msg.userid && <div className="flex-end">
                    <div style={{ maxWidth: '80%' }} className="gap-h-10   padding-10 item-hover-focus  round-16">
                        <div dangerouslySetInnerHTML={{ __html: msg.content }}></div>
                    </div>
                </div>}

                {!msg.userid && msg.content && <div style={{ maxWidth: '80%' }} className="gap-h-10 padding-10 border-light shadow-s  round-16" >
                    <div className="break-all gap-b-10 md" dangerouslySetInnerHTML={{ __html: msg.content }}>
                    </div>
                    {msg.asking == false && <div> {msg.refs && msg.refs.length > 0 && <div className="f-12 remark gap-b-3"><S>引用页面</S></div>}
                        {msg.refs?.map(rf => {
                            return <div className="flex gap-b-5" key={rf.page?.id}>
                                <span onMouseDown={e => this.openPage(rf)} className="flex item-hover round gap-r-5 padding-w-3 l-20 cursor "><Icon size={18} icon={getPageIcon(rf.page)}></Icon><span className="gap-l-5">{getPageText(rf.page)}</span></span>
                                {rf.blockIds.length > 1 && <span className="flex flex-fixed ">{rf.blockIds.map((b, i) => {
                                    return <em onMouseDown={e => this.openPage(rf, b)} className="bg-hover bg-p-light text-p  padding-w-3 round gap-w-5 cursor" key={i}>{i}</em>
                                })}</span>}
                            </div>
                        })}
                        <div className="flex r-gap-r-20 gap-t-20">
                            <Button size="small" onMouseDown={e => {
                                var ele = (e.currentTarget as HTMLElement).closest('[data-ai-message]');
                                console.log(ele, ele.children[0])
                                var md = ele.querySelector('.md') as HTMLElement;
                                var c = md.innerText;
                                console.log('cccc', c);
                                CopyAlert(c, lst('已复制'))

                            }} ghost icon={DuplicateSvg}><S>复制</S></Button>
                            <Button size="small" onMouseDown={e => { this.tryAgain(msg) }} ghost icon={RefreshSvg} ><S>重新尝试</S></Button>
                        </div></div>}
                </div>}
            </div>
        })
    }
    openPage(page: {
        blockIds: string[];
        page: LinkPageItem<{}>;
        elementUrl: string;
    }, blockId?: string) {
        if (!blockId) blockId = page.blockIds[0];
        if(!blockId)blockId=undefined;
        console.log(page.elementUrl);
        channel.act('/page/open', { elementUrl: page.elementUrl, config: { force: true, blockId: blockId } })
        this.emit('close');
    }
    async openProperty(event: React.MouseEvent) {
        this.messages = [];
        this.forceUpdate();
        await channel.act('/cache/set', { key: this.getCacheKey(), value: this.messages })
    }
    render() {
        return <div className={"bg-white  round flex flex-col flex-full" + (isMobileOnly ? " vw100-20" : " w-800 ")}>
            <div className="padding-w-5 flex  padding-h-5">
                <span className="size-24 flex-center">
                    <Icon className={'text-pu'} size={18} icon={AiStartSvg}></Icon>
                </span>
                <span className="text-1 flex-auto text-overflow">
                    {lst('智能搜索')}
                </span>
                <span className="flex-fixed flex">
                    <ToolTip overlay={<S>清空对话</S>}><span onMouseDown={e => this.openProperty(e)} className="flex-center remark size-24 item-hover round cursor">
                        <Icon icon={{ name: 'byte', code: 'clear' }} size={16}></Icon>
                    </span></ToolTip>
                </span>
            </div>
            <Divider></Divider>
            <div style={{ paddingBottom: 50 }} className="padding-w-30  min-h-300 max-h-400 overflow-y" ref={e => this.scrollEl = e}>
                {this.renderMessages()}
            </div>
            <div className="flex gap-w-30 padding-w-10   border-light shadow-s round-16 gap-h-10 " style={{ minHeight: 36 }}>
                <div className="flex-auto ">
                    <DivInput
                        value={this.prompt}
                        rf={e => this.textarea = e}
                        onInput={e => { this.prompt = e }}
                        onEnter={e => this.send()}
                        className='min-h-20 l-20 max-h-100  overflow-y'
                        onPaster={e => {
                            this.emit('update')
                        }}
                        placeholder={lst("告诉AI你想问什么...")} ></DivInput>
                </div>
                <ToolTip overlay={<div>
                    <div className="flex"><span style={{ color: '#bbb' }}>Enter</span><span className="gap-l-5"><S>发送</S></span></div>
                    <div className="flex"><span style={{ color: '#bbb' }}>Shift+Enter</span><span className="gap-l-5"><S>换行</S></span></div>
                </div>}><div onMouseDown={e => this.send()} className="flex-fixed text-1 size-24 flex-center item-hover round">
                        <Icon size={16} icon={PublishSvg}></Icon>
                    </div>
                </ToolTip>
            </div>
        </div>
    }
    textarea: HTMLElement;
    scrollEl: HTMLElement;
    prompt: string = '';
    async tryAgain(message: any) {
        this.prompt = message.prompt;
        await this.send(true);
    }
    async send(isTry?: boolean) {
        if (!this.prompt) return;
        try {
            var self = this;
            var prompt = this.prompt;
            this.prompt = '';
            this.textarea.innerHTML = '';
            var u = channel.query('/query/current/user');
            var sender = { id: util.guid(), userid: u.id, date: new Date(), content: prompt }
            // if (isTry !== true)
            this.messages.push(sender)
            this.forceUpdate(() => {
                if (this.scrollEl) {
                    this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
                }
            });
            var cb = { id: util.guid(), prompt, date: new Date(), asking: true, content: '', noAnswer: false, refs: [] };
            this.messages.push(cb);
            this.forceUpdate();
            var r = await getWsContext(prompt);
            if (r.context) {
                cb.refs = r.refs;
                var text = '';
                cb.content = `<span class='typed-print'></span>`;
                var content = getTemplateInstance(AskTemplate, {
                    prompt: prompt,
                    context: r.context
                });
                this.forceUpdate();
                await new Promise(async (resolve, reject) => {
                    await channel.post('/text/ai/stream', {
                        question: content,
                        model: getAiDefaultModel(this.ws.aiConfig.text),
                        callback(str, done) {
                            if (typeof str == 'string') text += str;
                            cb.content = marked.parse(text + (done ? "" : "<span class='typed-print'></span>"));
                            self.forceUpdate(() => {
                                // var el = self.scrollEl.querySelector('.typed-print');
                                // if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
                                self.scrollEl.scrollTop = self.scrollEl.scrollHeight;
                            });
                            if (done) {
                                self.scrollEl.scrollTop = self.scrollEl.scrollHeight;
                                cb.asking = false;
                                resolve(true)
                            }
                        }
                    });
                })
            }
            else {
                cb.content = lst('没有搜到关联的答案');
                cb.noAnswer = true;
                cb.asking = false;
            }
        }
        catch (ex) {
            console.error(ex);
        }
        finally {
            this.forceUpdate(() => {
                if (this.scrollEl) {
                    this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
                }
            });
            await channel.act('/cache/set', { key: this.getCacheKey(), value: this.messages })
            this.emit('update')
        }
    }
    getCacheKey() {
        return AI_SEARCH_MESSAGES + this.ws.id;
    }
    ws: LinkWs;
    async open(options: { ws: any, word?: string }) {
        this.ws = options.ws;
        var rs = await channel.query('/cache/get', { key: this.getCacheKey() });
        if (Array.isArray(rs)) this.messages = rs;
        if (options?.word) this.prompt = options.word;
        if (this.scrollEl) {
            this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
        }
        this.forceUpdate();
    }
}

export async function useAISearchBox(options: { ws: LinkWs, word?: string }) {
    var pos: PopoverPosition = { center: true, centerTop: 100 };
    let popover = await PopoverSingleton(AISearchBox, { mask: true, frame: true, shadow: true, });
    let fv = await popover.open(pos);
    await fv.open(options);
    return new Promise((resolve: (p: { id: string, content?: string }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        popover.only('close', () => {
            resolve(null)
        });
        fv.only('update', () => {
            popover.updateLayout()
        })
    })
}