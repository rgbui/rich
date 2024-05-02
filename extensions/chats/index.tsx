import dayjs from "dayjs";
import lodash from "lodash";
import React from "react";
import {
    FileIconSvg,
    DownloadSvg,
    Edit1Svg,
    ReplySvg,
    DotsSvg,
    TrashSvg,
    CheckSvg,
    EmojiSvg, DuplicateSvg
} from "../../component/svgs";
import { Avatar } from "../../component/view/avator/face";
import { UserBox } from "../../component/view/avator/user";
import { Icon } from "../../component/view/icon";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { SockResponse } from "../../net/declare";
import {
    ElementType,
    autoImageUrl,
    getElementUrl,
    getEmoji
} from "../../net/element.type";
import { KeyboardCode } from "../../src/common/keys";
import { Rect } from "../../src/common/vector/point";
import { UserBasic } from "../../types/user";
import { util } from "../../util/util";
import { useOpenEmoji } from "../emoji";
import { EmojiCode } from "../emoji/store";
import { ChannelTextType } from "./declare";
import { ToolTip } from "../../component/view/tooltip";
import { S } from "../../i18n/view";
import { lst } from "../../i18n/store";
import { useImageViewer } from "../../component/view/image.preview";
import { CopyAlert } from "../../component/copy";
import { LinkWs } from "../../src/page/declare";
import { useOpenReport } from "../report";
import { getChatText } from "../../component/view/input.chat/util";
import "./style.less";
import { InputChatBox } from "../../component/view/input.chat/box";

export class ViewChats extends React.Component<{
    readonly?: boolean,
    ws?: LinkWs,
    redit(d: ChannelTextType)
    delChat(d: ChannelTextType): Promise<SockResponse<void, string>>
    emojiChat(d: ChannelTextType, re: Partial<EmojiCode>): Promise<SockResponse<{
        emoji: {
            emojiId: string;
            code?: string;
            count: number;
        };
    }, string>>,
    patchChat(d: ChannelTextType, data: { content: string }): Promise<SockResponse<void, string>>
    reportChat(d: ChannelTextType),
    replyChat(d: ChannelTextType),
    user: UserBasic;
    chats: ChannelTextType[],
    searchUser?: (word: string) => Promise<UserBasic[]>
}> {
    editChannelText: ChannelTextType = null;
    el: HTMLElement;
    currentChats: ChannelTextType[];
    get sortChats() {
        if (Array.isArray(this.currentChats)) return this.currentChats.sort((x, y) => {
            if (x.createDate.getTime() > y.createDate.getTime()) return 1
            else return -1;
        })
        return this.props.chats.sort((x, y) => {
            if (x.createDate.getTime() > y.createDate.getTime()) return 1
            else return -1;
        })
    }
    chatInput: InputChatBox;
    get currentUser(): UserBasic {
        return this.props.user
    }
    openPic(f) {
        useImageViewer(f, [f])
    }
    renderContent(d: ChannelTextType) {
        var files = d.file ? [d.file] : d.files;
        if (!Array.isArray(files)) files = [];
        var jsList: JSX.Element[] = [];
        if (d.content) jsList.push(<div key={d.id + "c"} className='shy-user-channel-chat-content'>
            <span dangerouslySetInnerHTML={{ __html: d.content }}></span>
            {d.isEdited && <span className="sy-channel-text-edited-tip f-12 text">(<S>已编辑</S>)</span>}
        </div>)
        for (let i = 0; i < files.length; i++) {
            var f = files[i];
            if (f.mime == 'image') {
                jsList.push(<div key={i} className='gap-h-5' >
                    <img className="round obj-center max-w-400 max-h-500" data-json={JSON.stringify(f)} onMouseDown={e => {
                        var j = JSON.parse(e.currentTarget.getAttribute('data-json'));
                        this.openPic(j)
                    }} src={autoImageUrl(f.url, 500)} />
                </div>)
            }
            else if (f.mime == 'video') {
                jsList.push(<div key={i} className='   gap-h-5' >
                    <video className="round obj-center max-w-400 max-h-500" controls src={f.url}></video>
                </div>)
            }
            else if (f.mime == 'audio') {
                jsList.push(<div key={i} className=' gap-h-5' >
                    <audio controls src={f.url}></audio>
                </div>)
            }
            else jsList.push(<div key={i} className=' gap-h-5' >
                <div className=" flex max-w-300 padding-10 round item-hover-light-focus item-hover">
                    <Icon className={'flex-fixed gap-r-5 text-link'} style={{ fill: 'currentcolor' }} size={32} icon={FileIconSvg}></Icon>
                    <ToolTip overlay={f.filename}><span className="max-w-200 text-overflow gap-r-5">{f.filename}</span></ToolTip>
                    <span className="remark flex-auto">{util.byteToString(f.size)}</span>
                    <a className="flex-fixed cursor  text-link gap-l-5 size-24 round item-hover flex-center " target="_blank" href={f.url} download={f.text}>
                        <Icon size={18} icon={DownloadSvg}></Icon>
                    </a>
                </div>
            </div>)
        }
        return <div key={d.id + "cc"}>{jsList}</div>;
    }
    renderDateTip(date: Date) {
        var dateStr = '';
        var now = dayjs(new Date());
        var day = dayjs(date);
        if (now.diff(day, 'hour') < 24) {
            dateStr = day.format('HH:mm')
        }
        else if (now.diff(day, 'day') < 7) {
            var d = day.day();
            var w = [lst('周日'), lst('周一'), lst('周二'), lst('周三'), lst('周四'), lst('周五'), lst('周六')][d];
            dateStr = `${w}${day.format(' HH:mm')}`
        }
        else dateStr = day.format('YYYY-MM-DD HH:mm')
        return <div key={date.getTime()} className="sy-channel-text-item-tip-date">
            <div className="line"></div>
            <span className="text">{dateStr}</span>
        </div>
    }
    renderItem(d: ChannelTextType, noUser: boolean) {
        if (d.isDeleted) {
            if (d.userid == this.currentUser.id) {
                return <div key={d.id} className="sy-channel-text-item-deleted remark f-12"><S>你撤回了一条消息</S><a onClick={e => this.redit(d)}><S>重新编辑</S></a></div>
            }
            else return <div key={d.id} className="sy-channel-text-item-deleted remark f-12"><UserBox userid={d.userid}>{us => <span>"{us.name}"</span>}</UserBox><S>撤回了一条消息</S></div>
        }
        return <div data-channel-text-id={d.id} className={"sy-channel-text-item" + (noUser ? " no-user" : "")} key={d.id}>
            {d.reply && <div className="sy-channel-text-item-reply">
                <UserBox userid={d.reply.userid}>{us => {
                    return < ><Avatar ws={this.props.ws} showCard user={us} userid={d.userid} size={16}></Avatar>
                        <div className="sy-channel-text-item-reply-content f-12 text-overflow">{this.renderContent(d.reply)}</div>
                    </>
                }}</UserBox>
            </div>}
            {d.id && d.id == this.editChannelText?.id && <div key={d.id} className="sy-channel-text-item-edited">
                <UserBox userid={d.userid}>{us => {
                    return <>
                        <div className="sy-channel-text-item-edited-content">
                            <Avatar ws={this.props.ws} showCard user={us} userid={d.userid} size={40}></Avatar>
                            <div className="sy-channel-text-item-edited-content-wrapper" >
                                <div className="sy-channel-text-item-head">
                                    <a>{us.name}</a>
                                    {us?.role == 'robot' && <span className='bg-p-1 text-white round flex-center flex-inline padding-w-3  h-16 gap-w-2' style={{ display: 'inline-flex', color: '#fff', backgroundColor: 'rgb(88,101,242)' }}>
                                        <Icon icon={CheckSvg} size={12}></Icon><span className='gap-l-2 f-12' style={{ lineHeight: '12px', color: '#fff' }}><S>机器人</S></span>
                                    </span>}
                                    <span>{util.showTime(d.createDate)}</span>
                                </div>
                                <div className="sy-channel-text-item-edited-content-input  item-hover-focus">
                                    <InputChatBox
                                        userid={this.currentUser?.id}
                                        display='redit'
                                        ws={this.props.ws}
                                        value={getChatText(d.content)}
                                        disabledUploadFiles={true}
                                        disabledRobot={true}
                                        ref={e => this.chatInput = e}
                                        placeholder={lst("回车提交")}
                                        onChange={e => this.edit(d,
                                            { content: e.content }
                                        )}
                                    ></InputChatBox>
                                </div>
                            </div>
                        </div>
                        <div className="sy-channel-text-item-edited-tip flex text-1"><S>ESC键</S><a className="gap-r-5" onClick={e => this.closeEdit()}><S>取消</S></a><S>回车键</S><a onMouseDown={e => this.chatInput.onEnter()}><S>保存</S></a></div>
                    </>
                }}</UserBox>
            </div>
            }
            {!(d.id == this.editChannelText?.id) && !noUser && <UserBox userid={d.userid}>{us => {
                return <div className="sy-channel-text-item-box" >
                    <Avatar ws={this.props.ws} showCard user={us} userid={d.userid} size={40}></Avatar>
                    <div className="sy-channel-text-item-wrapper" >
                        <div className="sy-channel-text-item-head">
                            <a>{us.name}</a>
                            {us?.role == 'robot' && <span className='bg-p-1 text-white round flex-center flex-inline padding-w-3  h-16 gap-w-2' style={{ display: 'inline-flex', color: '#fff', backgroundColor: 'rgb(88,101,242)' }}>
                                <Icon icon={CheckSvg} size={12}></Icon><span className='gap-l-2 f-12' style={{ lineHeight: '12px', color: '#fff' }}><S>机器人</S></span>
                            </span>}
                            <span>{util.showTime(d.createDate)}</span></div>
                        <div className="sy-channel-text-item-content">{this.renderContent(d)}</div>
                    </div>
                </div>
            }}</UserBox>}
            {!(d.id == this.editChannelText?.id) && noUser && <div className="sy-channel-text-item-box" >
                <div className="sy-channel-text-item-date text-1">{dayjs(d.createDate).format('HH:mm')}</div>
                <div className="sy-channel-text-item-wrapper" >
                    <div className="sy-channel-text-item-content">{this.renderContent(d)}</div>
                </div>
            </div>}
            {Array.isArray(d.emojis) && <div className="sy-channel-text-item-emojis gap-l-50 flex padding-h-10">{d.emojis.filter(g => g.count > 0).map(em => {
                return <a className="round-8 item-hover-light-focus" onMouseDown={e => this.editEmoji(d, em)} key={em.emojiId} >
                    <Icon icon={{ code: em.code, name: 'emoji' }} size={16} ></Icon>
                    <span>{em.count}</span>
                </a>
            })}</div>}
            {!(d.id == this.editChannelText?.id) && this.props.readonly !== true && <div className="sy-channel-text-item-operators shadow-s bg-white border-light  flex r-size-24 h-24 r-cursor r-round r-flex-center r-item-hover">
                <ToolTip overlay={lst('添加表情')}><span onMouseDown={e => this.addEmoji(d, e)}><Icon size={16} icon={EmojiSvg}></Icon></span></ToolTip>
                {d.userid == this.currentUser.id && <ToolTip overlay={lst('编辑')}><span onMouseDown={e => this.openEdit(d)}><Icon size={16} icon={Edit1Svg}></Icon></span></ToolTip>}
                <ToolTip overlay={lst('回复')}><span onMouseDown={e => this.reply(d)}><Icon size={16} icon={ReplySvg}></Icon></span></ToolTip>
                <span onMouseDown={e => this.openProperty(d, e)}><Icon size={16} icon={DotsSvg}></Icon></span>
            </div>}
        </div>
    }
    render() {
        var dm = this.sortChats;
        var ds: JSX.Element[] = [];
        var splitLastDate: Date;
        var lastUserid: string = '';
        var lastDate: Date;
        for (let i = 0; i < dm.length; i++) {
            var d = dm[i];
            var noUser: boolean = false;
            if (lastUserid == d.userid && lastDate && d.createDate && (d.createDate.getTime() - lastDate.getTime()) < 1000 * 60 * 3)
                noUser = true;
            if (d.replyId) noUser = false;
            if (i > 0 && dm[i - 1].isDeleted == true) noUser = false;
            if (!splitLastDate || splitLastDate && dayjs(d.createDate).diff(splitLastDate, 'minute') > 60) {
                ds.push(this.renderDateTip(d.createDate))
                splitLastDate = d.createDate;
            }
            lastDate = d.createDate;
            ds.push(this.renderItem(d, noUser));
            lastUserid = d.userid;
        }
        return <div className="sy-channel-view-chats" ref={e => this.el = e}>{ds}</div>
    }
    componentDidMount(): void {
        document.addEventListener('keydown', this.keydown)
    }
    componentWillUnmount(): void {
        document.addEventListener('keyup', this.keydown)
    }
    keydown = (event: KeyboardEvent) => {
        if (event?.key?.toLowerCase() == KeyboardCode.Esc.toLowerCase()) {
            this.closeEdit();
        }
    }
    private getOp(d: ChannelTextType) {
        var op = this.el.querySelector('[data-channel-text-id=\"' + d.id + '\"] .sy-channel-text-item-operators');
        op.classList.add('operating');
        return op;
    }
    private async addEmoji(d: ChannelTextType, rect: Rect | React.MouseEvent) {
        var op = this.getOp(d);
        try {
            var re = await useOpenEmoji({
                roundArea: rect instanceof Rect ? rect : Rect.fromEvent(rect),
                direction: 'top',
                align: 'end'
            });
            if (re) {
                var result = await this.emojiChat(d, re);
                if (!Array.isArray(d.emojis)) {
                    d.emojis = [];
                }
                if (result?.data?.emoji) {
                    var em = d.emojis.find(g => g.emojiId == result.data.emoji.emojiId);
                    if (em) {
                        Object.assign(em, result.data.emoji)
                    }
                    else d.emojis.push(result.data.emoji);
                    this.forceUpdate();
                }
            }
        }
        catch (ex) {

        }
        finally {
            op.classList.remove('operating');
        }
    }
    editEmoji = lodash.throttle(async (
        d: ChannelTextType,
        emoji: { emojiId: string; code?: string; count?: number; }) => {
        if (this.props.readonly) return;
        var result = await this.emojiChat(d, emoji);
        if (!Array.isArray(d.emojis)) {
            d.emojis = [];
        }
        var em = d.emojis.find(g => g.emojiId == result.data.emoji.emojiId);
        if (em) {
            Object.assign(em, result.data.emoji)
        }
        else d.emojis.push(result.data.emoji);
        this.forceUpdate();
    }, 1000)
    private async openEdit(d: ChannelTextType) {
        this.editChannelText = d;
        this.forceUpdate(async () => {
            if (this.chatInput) {
                this.chatInput.cp.onFocus()
                this.chatInput.cp.richEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
                return;
            }
            await util.delay(100);
            if (this.chatInput) {
                this.chatInput.cp.onFocus()
                this.chatInput.cp.richEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }

        });
    }
    private closeEdit() {
        this.editChannelText = null;
        this.forceUpdate();
    }
    private async edit(d: ChannelTextType, data: { content?: string }) {
        this.closeEdit();
        if (data.content) {
            var re = await this.patchChat(d, { content: data.content });
            if (re.ok) {
                d.content = data.content;
                d.isEdited = true;
                this.forceUpdate()
            }
        }
    }
    redit(d: ChannelTextType) {
        this.props.redit(d);
    }
    async reply(d: ChannelTextType) {
        await this.props.replyChat(d)
    }
    async report(d: ChannelTextType) {
        await useOpenReport({
            reportContent: d.content,
            userid: d.userid,
            workspaceId: d.workspaceId,
            reportElementUrl: getElementUrl(ElementType.RoomChat, d.roomId, d.id)
        })
    }
    private async del(d: ChannelTextType) {
        var op = this.getOp(d);
        d.isDeleted = true;
        await this.props.delChat(d);
        op.classList.remove('operating');
        this.forceUpdate();
    }
    async emojiChat(d: ChannelTextType, re: Partial<EmojiCode>) {
        return await this.props.emojiChat(d, re);
    }
    async patchChat(d: ChannelTextType, data: { content: string }) {
        return await this.props.patchChat(d, data);
    }
    async openProperty(d: ChannelTextType, event: React.MouseEvent) {
        var op = this.getOp(d);
        var items: MenuItem<string>[] = [];
        if (d.userid == this.currentUser.id) {
            items.push({ name: 'emoji', text: lst('表情'), icon: EmojiSvg })
            items.push({ name: 'edit', text: lst('编辑'), icon: { name: 'byte', code: 'write' } });
            items.push({ name: 'reply', text: lst('回复'), icon: ReplySvg });
            items.push({ type: MenuItemType.divide });
            items.push({ name: 'copy', disabled: d.content ? false : true, text: lst('拷贝'), icon: DuplicateSvg });
            items.push({ type: MenuItemType.divide });
            items.push({ name: 'delete', text: lst('删除'), icon: TrashSvg });
        }
        else {
            items.push({ name: 'emoji', text: lst('表情'), icon: EmojiSvg })
            items.push({ name: 'reply', text: lst('回复'), icon: ReplySvg });
            items.push({ name: 'copy', disabled: d.content ? false : true, text: lst('拷贝'), icon: DuplicateSvg });
            items.push({ type: MenuItemType.divide });
            items.push({ name: 'report', text: lst('举报'), icon: { name: 'bytedance-icon', code: 'harm' } });
        }
        var rect = Rect.fromEle(event.currentTarget as HTMLElement);
        var r = await useSelectMenuItem({ roundArea: rect },
            items
        );
        if (r?.item) {
            if (r.item.name == 'report') {
                await this.report(d);
            }
            else if (r.item.name == 'edit') {
                await this.openEdit(d)
            }
            else if (r.item.name == 'reply') {
                await this.reply(d)
            }
            else if (r.item.name == 'delete') {
                await this.del(d);
            }
            else if (r.item.name == 'copy') {
                if (d.content) {
                    CopyAlert(d.content, lst('已拷贝'))
                }
            }
            else if (r.item.name == 'emoji') {
                this.addEmoji(d, rect)
            }
        }
        op.classList.remove('operating');
    }
    async updateChats(chats: ChannelTextType[]) {
        this.currentChats = chats;
        return new Promise((resolve, reject) => {
            this.forceUpdate(() => {
                resolve(true);
            })
        })
    }
}