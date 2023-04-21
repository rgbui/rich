import dayjs from "dayjs";
import lodash from "lodash";
import React from "react";
import { FileIconSvg, DownloadSvg, Emoji1Svg, Edit1Svg, ReplySvg, DotsSvg, EditSvg, TrashSvg, ReportSvg } from "../../component/svgs";
import { Avatar } from "../../component/view/avator/face";
import { UserBox } from "../../component/view/avator/user";
import { Icon } from "../../component/view/icon";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItem } from "../../component/view/menu/declare";
import { Remark } from "../../component/view/text";
import { SockResponse } from "../../net/declare";
import { autoImageUrl, getEmoji } from "../../net/element.type";
import { KeyboardCode } from "../../src/common/keys";
import { Rect } from "../../src/common/vector/point";
import { UserBasic } from "../../types/user";
import { util } from "../../util/util";
import { useOpenEmoji } from "../emoji";
import { EmojiCode } from "../emoji/store";
import { ChannelTextType } from "./declare";
import "./style.less";
import { ChatInput } from "../../component/view/input.chat/chat";

export class ViewChats extends React.Component<{
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
    chatInput: ChatInput;
    get currentUser(): UserBasic {
        return this.props.user
    }
    renderContent(d: ChannelTextType) {
        var files = d.file ? [d.file] : d.files;
        if (!Array.isArray(files)) files = [];
        var jsList: JSX.Element[] = [];
        if (d.content) jsList.push(<div key={d.id + "c"} className='shy-user-channel-chat-content'>
            <span dangerouslySetInnerHTML={{ __html: d.content }}></span>
            {d.isEdited && <span className="sy-channel-text-edited-tip">(已编辑)</span>}
        </div>)
        for (let i = 0; i < files.length; i++) {
            var f = files[i];
            if (f.mime == 'image') {
                jsList.push(<div key={i} className='shy-user-channel-chat-image' >
                    <img src={autoImageUrl(f.url, 500)} />
                </div>)
            }
            else if (f.mime == 'video') {
                jsList.push(<div key={i} className='shy-user-channel-chat-video' >
                    <video controls src={f.url}></video>
                </div>)
            }
            else jsList.push(<div key={i} className='shy-user-channel-chat-file' >
                <div className="shy-user-channel-chat-file-content">
                    <Icon size={40} icon={FileIconSvg}></Icon>
                    <div className='shy-user-channel-chat-file-content-info' >
                        <span>{f.name}</span>
                        <Remark>{util.byteToString(f.size)}</Remark>
                    </div>
                    <a href={f.url} download={f.text}>
                        <Icon size={30} icon={DownloadSvg}></Icon>
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
            var w = ['日', '一', '二', '三', '四', '五', '六'][d];
            dateStr = `周${w}${day.format(' HH:mm')}`
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
                return <div key={d.id} className="sy-channel-text-item-deleted"><Remark>你撤回了一条消息<a onClick={e => this.redit(d)}>重新编辑</a></Remark></div>
            }
            else return <div key={d.id} className="sy-channel-text-item-deleted"><Remark><UserBox userid={d.userid}>{us => <span>"{us.name}"</span>}</UserBox>撤回了一条消息</Remark></div>
        }
        return <div data-channel-text-id={d.id} className={"sy-channel-text-item" + (noUser ? " no-user" : "")} key={d.id}>
            {d.reply && <div className="sy-channel-text-item-reply">
                <UserBox userid={d.reply.userid}>{us => {
                    return < ><Avatar showCard user={us} userid={d.userid} size={16}></Avatar>
                        <div className="sy-channel-text-item-reply-content">{this.renderContent(d.reply)}</div>
                    </>
                }}</UserBox>
            </div>}
            {d.id && d.id == this.editChannelText?.id && <div key={d.id} className="sy-channel-text-item-edited">
                <UserBox userid={d.userid}>{us => {
                    return <>
                        <div className="sy-channel-text-item-edited-content">
                            <Avatar showCard user={us} userid={d.userid} size={40}></Avatar>
                            <div className="sy-channel-text-item-edited-content-wrapper" >
                                <div className="sy-channel-text-item-head"><a>{us.name}</a><span>{util.showTime(d.createDate)}</span></div>
                                <div className="sy-channel-text-item-edited-content-input">
                                    <ChatInput
                                        ref={e => this.chatInput = e}
                                        value={d.content}
                                        placeholder="回车提交"
                                        onEnter={e => this.edit(d, { content: e })}
                                        searchUser={this.props.searchUser}
                                    >
                                    </ChatInput>
                                </div>
                            </div>
                        </div>
                        <div className="sy-channel-text-item-edited-tip">ESC键<a onClick={e => this.closeEdit()}>取消</a>•回车键<a onMouseDown={e => this.chatInput.onEnter()}>保存</a></div>
                    </>
                }}</UserBox>
            </div>
            }
            {!(d.id == this.editChannelText?.id) && !noUser && <UserBox userid={d.userid}>{us => {
                return <div className="sy-channel-text-item-box" >
                    <Avatar showCard user={us} userid={d.userid} size={40}></Avatar>
                    <div className="sy-channel-text-item-wrapper" >
                        <div className="sy-channel-text-item-head"><a>{us.name}</a><span>{util.showTime(d.createDate)}</span></div>
                        <div className="sy-channel-text-item-content">{this.renderContent(d)}</div>
                    </div>
                </div>
            }}</UserBox>}
            {!(d.id == this.editChannelText?.id) && noUser && <div className="sy-channel-text-item-box" >
                <div className="sy-channel-text-item-date">{dayjs(d.createDate).format('HH:mm')}</div>
                <div className="sy-channel-text-item-wrapper" >
                    <div className="sy-channel-text-item-content">{this.renderContent(d)}</div>
                </div>
            </div>}
            {Array.isArray(d.emojis) && <div className="sy-channel-text-item-emojis">{d.emojis.filter(g => g.count > 0).map(em => {
                return <a onMouseDown={e => this.editEmoji(d, em)} key={em.emojiId} >
                    <span dangerouslySetInnerHTML={{ __html: getEmoji(em.code) }}></span>
                    <span>{em.count}</span>
                </a>
            })}</div>}
            {!(d.id == this.editChannelText?.id) && <div className="sy-channel-text-item-operators">
                <span onMouseDown={e => this.addEmoji(d, e)}><Icon size={16} icon={Emoji1Svg}></Icon></span>
                {d.userid == this.currentUser.id && <span onMouseDown={e => this.openEdit(d)}><Icon size={16} icon={Edit1Svg}></Icon></span>}
                {d.userid != this.currentUser.id && <span onMouseDown={e => this.reply(d)}><Icon size={16} icon={ReplySvg}></Icon></span>}
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
        if (event.key.toLowerCase() == KeyboardCode.Esc.toLowerCase()) {
            this.closeEdit();
        }
    }
    private getOp(d: ChannelTextType) {
        var op = this.el.querySelector('[data-channel-text-id=\"' + d.id + '\"] .sy-channel-text-item-operators');
        op.classList.add('operating');
        return op;
    }
    private async addEmoji(d: ChannelTextType, e: React.MouseEvent) {
        var op = this.getOp(d);
        var re = await useOpenEmoji({
            roundArea: Rect.fromEvent(e),
            direction: 'top',
            align: 'end'
        });
        var result = await this.emojiChat(d, re);
        if (!Array.isArray(d.emojis)) {
            d.emojis = [];
        }
        var em = d.emojis.find(g => g.emojiId == result.data.emoji.emojiId);
        if (em) {
            Object.assign(em, result.data.emoji)
        }
        else d.emojis.push(result.data.emoji);
        op.classList.remove('operating');
        this.forceUpdate();
    }
    editEmoji = lodash.throttle(async (
        d: ChannelTextType,
        emoji: { emojiId: string; code?: string; count?: number; }) => {
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
        this.forceUpdate();
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
        await this.props.replyChat(d);
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
            items.push({ name: 'edit', text: '编辑', icon: EditSvg });
            items.push({ name: 'delete', text: '删除', icon: TrashSvg });
        }
        else {
            items.push({ name: 'reply', text: '回复', icon: ReplySvg });
            items.push({ name: 'report', disabled: true, text: '举报', icon: ReportSvg });
        }
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) },
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