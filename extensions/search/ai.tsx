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
import { getUserQuestions, getWsContext, identifyUserProblems } from "../../net/ai/robot";
import { CopyAlert } from "../../component/copy";
import { getAiDefaultModel } from "../../net/ai/cost";
import { ToolTip } from "../../component/view/tooltip";
import { DivInput } from "../../component/view/input/div";
const AI_SEARCH_MESSAGES = 'AI_SEARCH_MESSAGES';
import "./style.less";
import { TextEle } from "../../src/common/text.ele";
import { useSelectMenuItem } from "../../component/view/menu";
import { Rect } from "../../src/common/vector/point";
import { MenuItemType } from "../../component/view/menu/declare";

export class AISearchBox extends EventsComponent {
    messages: {
        id: string,
        userid?: string,
        asking?: boolean,
        prompt?: string,
        date: number,
        net?: boolean,
        abort?: boolean,
        content: string,
        refs?: { blockIds: string[], page: LinkPageItem, elementUrl: string }[]
    }[] = [];
    isNet: boolean = false;
    renderMessages() {
        return this.messages.map((msg,i)=>{
            return <div className="visible-hover" data-ai-message={msg.id} key={msg.id}>

                {msg.userid && <div className="flex-end">
                    <div style={{ maxWidth: '80%' }} className="gap-h-10   padding-10 item-hover-focus  round-16">
                        <div dangerouslySetInnerHTML={{ __html: msg.content }}></div>
                    </div>
                </div>}

                {!msg.userid && msg.content && <div>
                    <div style={{ maxWidth: '80%' }} className="gap-h-10  shadow-s border-light round-8 padding-w-10" >
                        <div className="break-all  md gap-h-10" dangerouslySetInnerHTML={{ __html: msg.content }}>
                        </div>
                        {msg.abort && <div>
                            <div className="f-12 remark gap-b-3"><S>已终止回答</S></div>
                        </div>}
                        {msg.asking == false && msg.net == true && <div className="gap-b-10">
                            <div className="f-12 remark gap-b-3"><S>来源于网络</S></div>
                        </div>}
                        {msg.asking == false && msg.net !== true && (msg as any).noAnswer != true && <div className="gap-b-10"> {msg.refs && msg.refs.length > 0 && <div className="f-12 remark gap-b-3"><S>引用页面</S></div>}
                            {msg.refs?.map(rf => {
                                return <div className="flex gap-b-5" key={rf.page?.id}>
                                    <span onMouseDown={e => this.openPage(rf)} className="flex item-hover round gap-r-5 padding-w-3 l-20 cursor "><Icon className={'remark'} size={18} icon={getPageIcon(rf.page)}></Icon><span className="gap-l-5">{getPageText(rf.page)}</span></span>
                                    {rf.blockIds.length > 1 && <span className="flex flex-fixed ">{rf.blockIds.map((b, i) => {
                                        return <em onMouseDown={e => this.openPage(rf, b)} className="bg-hover bg-p-light text-p  padding-w-3 round gap-w-5 cursor" key={i}>{i}</em>
                                    })}</span>}
                                </div>
                            })}
                        </div>
                        }
                    </div>
                    <div className="flex visible r-gap-r-20  r-size-24 r-flex-center remark r-cursor r-item-hover r-round">
                        <ToolTip overlay={<S>复制</S>}>
                            <span onMouseDown={e => {
                                var ele = (e.currentTarget as HTMLElement).closest('[data-ai-message]');
                                var md = ele.querySelector('.md') as HTMLElement;
                                var c = md.innerText;
                                CopyAlert(c, lst('已复制'))
                            }}> <Icon icon={DuplicateSvg} size={18}></Icon></span>
                        </ToolTip>
                        <ToolTip overlay={<S>重新尝试</S>}>
                            <span onMouseDown={e => { this.tryAgain(msg) }}>
                                <Icon size={18} icon={RefreshSvg}></Icon>
                            </span>
                        </ToolTip>
                    </div>
                </div>}

                {i == this.messages.length - 1 && this.tips.length > 0 && this.messages.length > 0 && <div className="gap-h-5">
                    {this.tips.map((t, i) => {
                        return <div className="  h-22 " onMouseDown={e => {
                            this.prompt = t;
                            this.send();
                        }} key={i}>
                            <span className="item-hover padding-w-5 round padding-h-3 cursor" > {t}</span>
                        </div>
                    })}
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
        if (!blockId) blockId = undefined;
        console.log(page.elementUrl);
        channel.act('/page/open', { elementUrl: page.elementUrl, config: { force: true, blockId: blockId } })
        this.emit('close');
    }
    async openProperty(event: React.MouseEvent) {
        this.messages = [];
        this.forceUpdate();
        await channel.act('/cache/set', { key: this.getCacheKey(), value: { isNet: this.isNet, messages: this.messages } })
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
                <span className="flex-fixed flex">
                    <ToolTip overlay={<S>设置</S>}><span onMouseDown={e => this.openConfig(e)} className="flex-center remark size-24 item-hover round cursor">
                        <Icon icon={{ name: 'byte', code: 'setting-one' }} size={16}></Icon>
                    </span></ToolTip>
                </span>
            </div>
            <Divider></Divider>

            <div style={{ paddingBottom: 50 }} className="padding-w-30  min-h-300 max-h-400 overflow-y" ref={e => this.scrollEl = e}>
                {this.renderMessages()}
            </div>

            <div className="flex gap-w-30 padding-w-10  card-border round-16 gap-h-10 " style={{ minHeight: 36 }}>
                <div className="flex-auto ">
                    <DivInput
                        value={this.prompt}
                        ref={e => this.textarea = e}
                        onInput={e => { this.prompt = e }}
                        onEnter={e => this.send()}
                        className='min-h-20 padding-h-10 l-20 max-h-100  overflow-y'
                        onPaster={e => {
                            this.emit('update')
                        }}
                        placeholder={lst("告诉AI你想问什么...")} ></DivInput>
                </div>
                <ToolTip overlay={<div>
                    {this.controller && <div><span style={{ color: '#bbb' }}>正在处理中...</span></div>}
                    {!this.controller && <> <div className="flex"><span style={{ color: '#bbb' }}>Enter</span><span className="gap-l-5"><S>发送</S></span></div>
                        <div className="flex"><span style={{ color: '#bbb' }}>Shift+Enter</span><span className="gap-l-5"><S>换行</S></span></div>
                    </>}

                </div>}><div onMouseDown={e => { this.controller ? this.stop() : this.send() }} className="flex-fixed cursor text-1 size-24 flex-center item-hover round">
                        <Icon size={16} icon={this.controller ? { name: 'byte', code: "pause-one" } : PublishSvg}></Icon>
                    </div>
                </ToolTip>
            </div>

        </div>
    }
    textarea: DivInput;
    scrollEl: HTMLElement;
    prompt: string = '';
    tips: string[] = [];
    async tryAgain(message: any) {
        this.prompt = message.prompt;
        await this.send(true);
    }
    async openConfig(e: React.MouseEvent) {
        var self = this;
        var r = await useSelectMenuItem({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) }, [
            {
                text: '允许网络搜索',
                icon: { name: 'byte', code: 'earth' },
                name: 'net',
                value: this.isNet,
                type: MenuItemType.switch
            },
        ], {
            input(item, mp) {
                console.log(item);
                if (item.name == 'net') {
                    self.isNet = item.checked;
                    console.log('net...', self.isNet);
                }
            },
        })
    }
    controller?: AbortController;
    async send(isTry?: boolean) {
        if (!this.prompt) return;
        try {
            this.tips = [];
            var self = this;
            var prompt = this.prompt;
            this.prompt = '';
            this.controller = null;
            this.textarea.setValue('');
            var u = channel.query('/query/current/user');
            var sender = { id: util.guid(), userid: u.id, date: Date.now(), content: prompt }
            this.messages.push(sender)
            this.forceUpdate(() => {
                if (this.scrollEl) {
                    this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
                }
            });
            var cb = { net: false, id: util.guid(), abort: false, prompt, date: Date.now(), asking: true, content: '', noAnswer: false, refs: [] };
            this.messages.push(cb);
            var ms = this.messages.filter(m => m.userid ? true : false);
            ms = ms.slice(0, -1);
            ms = util.getLatestDataWithMinInterval(ms, 1000 * 60 * 30);
            var userProblem = await identifyUserProblems(prompt, ms.map(c => c.content))
            console.log(prompt, userProblem);
            this.forceUpdate();
            var r = await getWsContext(userProblem);
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
                        callback(str, done, c, abort) {
                            if (!self.controller && c) { self.controller = c; self.forceUpdate() }
                            if (typeof str == 'string') text += str;
                            cb.content = marked.parse(text + (done ? "" : "<span class='typed-print'></span>"));
                            self.forceUpdate(() => {
                                self.scrollEl.scrollTop = self.scrollEl.scrollHeight;
                            });
                            if (abort) cb.abort = true;
                            if (done) {
                                self.controller = null;
                                self.scrollEl.scrollTop = self.scrollEl.scrollHeight;
                                cb.asking = false;
                                resolve(true)
                            }
                        }
                    });
                })
                var tc = TextEle.filterHtml(cb.content);
                console.log(cb.content, tc);
                if (tc == '不知道') {
                    cb.content = lst('没有检索到关联的答案');
                    cb.noAnswer = true;
                    cb.asking = false;
                }
            }
            else {
                cb.content = lst('没有检索到关联的答案');
                cb.noAnswer = true;
                cb.asking = false;
            }

            if (this.isNet && cb.noAnswer == true) {
                cb.content = '';
                cb.noAnswer = false;
                cb.refs = [];
                cb.net = true;
                text = '';
                await new Promise(async (resolve, reject) => {
                    await channel.post('/text/ai/stream', {
                        question: userProblem,
                        model: getAiDefaultModel(this.ws.aiConfig.text),
                        callback(str, done, c, abort) {
                            if (!self.controller) {
                                self.controller = c;
                                self.forceUpdate();
                            }
                            if (typeof str == 'string') text += str;
                            cb.content = marked.parse(text + (done ? "" : "<span class='typed-print'></span>"));
                            self.forceUpdate(() => {
                                self.scrollEl.scrollTop = self.scrollEl.scrollHeight;
                            });
                            if (abort) cb.abort = true;
                            if (done) {
                                self.controller = null;
                                self.scrollEl.scrollTop = self.scrollEl.scrollHeight;
                                cb.asking = false;
                                resolve(true)
                            }
                        }
                    });
                })
            }
        }
        catch (ex) {
            console.error(ex);
        }
        finally {
            this.controller = null;
            this.forceUpdate(() => {
                if (this.scrollEl) {
                    this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
                }
                this.textarea.focus()
            });
            await channel.act('/cache/set', {
                key: this.getCacheKey(), value: {
                    isNet: this.isNet,
                    messages: this.messages
                }
            })
            this.emit('update')
            if (cb.noAnswer !== true) {
                var rc = await getUserQuestions(cb.content);
                if (Array.isArray(rc)) {
                    this.tips = rc;
                    this.forceUpdate(() => {
                        if (this.scrollEl) {
                            this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
                        }
                        this.emit('update')
                    })
                }
            }
        }
    }
    stop() {
        if (this.controller) {
            try {
                this.controller.abort();

            }
            catch (ex) {

            }
            this.controller = null;
        }
    }
    getCacheKey() {
        return AI_SEARCH_MESSAGES + this.ws.id;
    }
    ws: LinkWs;
    async open(options: { ws: any, word?: string }) {
        this.ws = options.ws;
        var rs = await channel.query('/cache/get', { key: this.getCacheKey() });
        if (Array.isArray(rs?.messages)) this.messages = rs.messages;
        if (typeof rs?.isNet == 'boolean') this.isNet = rs.isNet;
        else this.isNet = false;
        if (options?.word) this.prompt = options.word;
        this.forceUpdate(() => {
            if (this.scrollEl) {
                this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
                this.textarea.focus()
            }
        });
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