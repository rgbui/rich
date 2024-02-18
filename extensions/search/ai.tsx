import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { channel } from "../../net/channel";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { Avatar } from "../../component/view/avator/face";
import { UserBox } from "../../component/view/avator/user";
import { util } from "../../util/util";
import { marked } from "marked";
import { AskTemplate, getTemplateInstance } from "../ai/prompt";
import { Divider } from "../../component/view/grid";
import { isMobileOnly } from "react-device-detect";
import { lst } from "../../i18n/store";

import { LinkPageItem, LinkWs, getPageIcon } from "../../src/page/declare";
import { Icon } from "../../component/view/icon";
import { Input } from "../../component/view/input";
import { AiStartSvg, CloseSvg, DotsSvg, DuplicateSvg, TrashSvg } from "../../component/svgs";
import { S } from "../../i18n/view";
import { useSelectMenuItem } from "../../component/view/menu";
import { Rect } from "../../src/common/vector/point";
import { getWsContext } from "../../net/ai/robot";
import "./style.less";
import { CopyAlert } from "../../component/copy";
import { WsConsumeType, getAiDefaultModel } from "../../net/ai/cost";

var messages: { id: string, userid?: string, date: Date, content: string, refs?: { blockIds: string[], page: LinkPageItem, elementUrl: string }[] }[] = [];

export class AISearchBox extends EventsComponent {
    renderMessages() {
        return messages.map(msg => {
            return <div key={msg.id} className="visible-hover">
                {msg.userid && <UserBox userid={msg.userid}>{(user) => {
                    return <div className="flex flex-top gap-h-10">
                        <div className="flex-fixed gap-r-10">
                            <Avatar size={30} user={user}></Avatar>
                        </div>
                        <div className="flex-atuo">
                            <div className="flex">
                                <span className="flex-fixed">{user.name}</span>
                                <span className="flex-auto gap-l-10 remark">{util.showTime(msg.date)}</span>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: msg.content }}>
                            </div>
                        </div>
                    </div>
                }}</UserBox>}
                {!msg.userid && <div className="gap-h-20 relative gap-w-30 padding-15 border shadow round" >
                    <div className="pos visible" style={{ top: 0, right: 0 }}><span onMouseDown={e => { CopyAlert(msg.content, lst('已复制')) }} className="flex-center size-24 item-hover round cursor"><Icon size={18} icon={DuplicateSvg}></Icon></span></div>
                    <div dangerouslySetInnerHTML={{ __html: msg.content }}>
                    </div>
                    {msg.refs && msg.refs.length > 0 && <div className="f-12 remark"><S>引用页面</S></div>}
                    {msg.refs?.map(rf => {
                        return <div className="flex" key={rf.page?.id}>
                            <span onMouseDown={e => this.openPage(rf)} className="flex item-hover round gap-r-5"><Icon size={16} icon={getPageIcon(rf.page)}></Icon><span>{rf.page.text}</span></span>
                            {rf.blockIds.length > 1 && <span className="flex flex-fixed ">{rf.blockIds.map((b, i) => {
                                return <em onMouseDown={e => this.openPage(rf, b)} className="bg-hover bg-p-light text-p  padding-w-3 round gap-w-5 cursor" key={b}>{i}</em>
                            })}</span>}
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
        channel.air('/page/open', { elementUrl: page.elementUrl, config: { force: true, blockId: blockId } })
        this.emit('close');
    }
    async openProperty(event: React.MouseEvent) {
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, [{ text: lst('清空'), name: 'trash', icon: TrashSvg }]);
        if (r) {
            if (r.item.name == 'trash') {
                messages = [];
                this.forceUpdate();
            }
        }
    }
    render() {
        return <div className={"bg-white  round flex flex-col flex-full" + (isMobileOnly ? " vw100-20" : " w-800 ")}>
            <div className="padding-w-10 flex  padding-h-5">
                <span className="size-24 flex-center">
                    <Icon icon={AiStartSvg}></Icon>
                </span>
                <span className="remark flex-auto text-overflow">
                    {lst('智能搜索')}
                </span>
                <span className="flex-fixed flex">
                    <span onMouseDown={e => this.openProperty(e)} className="flex-center size-24 item-hover round cursor">
                        <Icon icon={DotsSvg} size={16}></Icon>
                    </span>
                    <span onMouseDown={e => this.emit('close')} className="flex-center size-24 item-hover round cursor">
                        <Icon icon={CloseSvg} size={14}></Icon>
                    </span>
                </span>
            </div>
            <Divider></Divider>
            <div className="padding-w-10 min-h-120 max-h-400 overflow-y" ref={e => this.scrollEl = e}>
                {this.renderMessages()}
            </div>
            <Divider></Divider>
            <div className="flex flex-top padding-w-10 gap-h-10">
                <div className="flex-auto "><Input
                    value={this.prompt}
                    ref={e => this.textarea = e}
                    onChange={e => this.prompt = e}
                    onEnter={e => this.send()}
                ></Input></div>
            </div>
        </div>
    }
    textarea: Input;
    scrollEl: HTMLElement;
    prompt: string = '';
    async send() {
        try {
            var self = this;
            var prompt = this.prompt;
            this.prompt = '';
            this.textarea.updateValue('');
            var u = channel.query('/query/current/user');
            var sender = { id: util.guid(), userid: u.id, date: new Date(), content: prompt }
            messages.push(sender)
            this.forceUpdate(() => {
                if (this.scrollEl) {
                    this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
                }
            });
            var cb = { id: util.guid(), date: new Date(), content: '', refs: [] };
            messages.push(cb);
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
                                var el = self.scrollEl.querySelector('.typed-print');
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
                            });
                            if (done) {
                                self.scrollEl.scrollTop = self.scrollEl.scrollHeight;
                                resolve(true)
                            }
                        }
                    });
                })
            }
            else {
                cb.content = lst('没有搜到关联的答案');
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
        }
    }


    ws: LinkWs;
    async open(options: { ws: any }) {
        this.ws = options.ws;
        if (this.scrollEl) {
            this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
        }
        //console.log(this.messages,'messages...');
        // this.forceUpdate();
    }
}

export async function useAISearchBox(options: { ws: LinkWs }) {
    var pos: PopoverPosition = { center: true, centerTop: 100 };
    let popover = await PopoverSingleton(AISearchBox, { mask: true, frame: true, shadow: true, });
    let fv = await popover.open(pos);
    fv.open(options);
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
    })
}