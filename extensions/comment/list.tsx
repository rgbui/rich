import React from "react";
import { CopyText } from "../../component/copy";
import { ShyAlert } from "../../component/lib/alert";
import { TrashSvg, DuplicateSvg, DotsSvg, LikeSvg } from "../../component/svgs";
import { Avatar } from "../../component/view/avator/face";
import { UserBox } from "../../component/view/avator/user";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItemType } from "../../component/view/menu/declare";
import { Pagination } from "../../component/view/pagination";
import { SpinBox } from "../../component/view/spin";
import { channel } from "../../net/channel";
import { getElementUrl, ElementType } from "../../net/element.type";
import { Rect } from "../../src/common/vector/point";
import { util } from "../../util/util";
import { lst } from "../../i18n/store";
import { S, Sp } from "../../i18n/view";
import { useUserCard } from "../../component/view/avator/card";
import { LinkWs } from "../../src/page/declare";
import { ChatInputType, InputChatBox } from "../../component/view/input.chat/box";
import { WsCommentType } from "./declare";

export class CommentListView extends React.Component<{
    userid: string;
    elementUrl: string;
    sort?: 'default' | 'date',
    displayFormat?: 'comment' | 'answer' | 'discuss',
    ws?: LinkWs,
    onChange?: (props: Record<string, any>) => void,
    contentHeight?: number
   
}> {
    list: WsCommentType[] = [];
    total = 0;
    index = 1;
    size = 30;
    sort = 'default';
    displayFormat?: 'comment' | 'discuss' = 'comment';
    userid: string;
    elementUrl: string;
    loading: boolean = false;
    checkSign() {
        var r = channel.query('/query/current/user');
        if (r?.id) {

        }
        else {
            ShyAlert(lst('请先登录'))
            return false;
        }
    }
    async likeComment(l: WsCommentType) {
        if (this.checkSign() == false) return;
        var r = await channel.put('/ws/comment/emoji', {
            elementUrl: getElementUrl(ElementType.WsCommentEmoji, l.id, 'like')
        });
        if (r.ok) {
            l.like.count = r.data.count;
            l.like.exists = r.data.exists;
            this.forceUpdate()
        }
    }
    async unlikeComment(l: WsCommentType) {
        if (this.checkSign() == false) return;
        var c = await channel.put('/ws/comment/emoji', {
            elementUrl: getElementUrl(ElementType.WsCommentEmoji, l.id, 'unlike'),
        });
        if (c.ok) {
            if (typeof l.unlike == 'undefined') l.unlike = { count: 0, users: [] };
            l.unlike.count = c.data.count;
            this.forceUpdate()
        }
    }
    currentReply: WsCommentType;
    async onReply(l: WsCommentType, user, event: React.MouseEvent) {
        if (this.checkSign() == false) return;
        if (!user) user = (channel.query('/query/current/user'))
        if (this.inputChatBox) {
            this.currentReply = l;
            this.inputChatBox.openReply({ text: l.text, replyId: l.id })
            if (this.inputChatBox.el)
                this.inputChatBox.el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }
    async onProperty(l: WsCommentType, event: React.MouseEvent) {
        if (this.checkSign() == false) return;
        var el = event.currentTarget as HTMLElement;
        el.classList.remove('visible');
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, [
            { name: 'copy', text: lst('复制'), icon: DuplicateSvg },
            { name: 'report', text: lst('举报'), icon: { name: 'bytedance-icon', code: 'harm' } },
            { type: MenuItemType.divide },
            { name: 'del', visible: this.userid == l.creater, text: lst('删除'), icon: TrashSvg }

        ]);
        el.classList.add('visible')
        if (r?.item) {
            if (r.item.name == 'del') {
                await channel.del('/ws/comment/del', { id: l.id });
                this.list.remove(g => g.id == l.id);
                if (!l.parentId) { this.total -= 1; }
                this.forceUpdate()
            }
            else if (r.item.name == 'report') {

            }
            else if (r.item.name == 'unlike') {

            }
            else if (r.item.name == 'copy') {
                CopyText(l.text);
                ShyAlert(lst('复制成功'))
            }
        }
    }
    async addComment(data: ChatInputType, event?: React.MouseEvent) {
        if (this.checkSign() == false) return;
        if (event) event.preventDefault();
        if (data) {
            var l: WsCommentType = this.currentReply && this.currentReply?.id == data.replyId ? this.currentReply : null;
            var r = await channel.put('/ws/comment/send', {
                elementUrl: this.elementUrl,
                parentId: data.replyId,
                rootId: l?.rootId ?? null,
                content: data.content,
                mentions: data.mentions,
                files: data.files
            });
            if (r.ok) {
                if (l) {
                    if (typeof l.replyCount != 'number') l.replyCount = 0;
                    l.replyCount += 1;
                    if (typeof l.replys == 'undefined') l.replys = {
                        page: 1,
                        size: 20,
                        total: 0,
                        list: []
                    }
                    l.replys?.list.push(r.data.data);
                    l.spread = true;
                    l.replys.total += 1;
                }
                else {
                    this.list.push(r.data.data);
                    this.total += 1;
                }
                this.forceUpdate()
            }
        }
    }
    async onExpends(l: WsCommentType) {
        if (l.replys) {
            l.spread = l.spread ? false : true;
            this.forceUpdate();
            return;
        }
        var r = await channel.get('/ws/comment/list', {
            elementUrl: this.elementUrl,
            parentId: l.id,
            sort: l.id ? 'default' : 'date',
            page: 1,
            size: 200,
            ws: this.props?.ws,
        });
        if (r?.ok) {
            l.replys = r.data;
            l.spread = true;
            this.forceUpdate();
        }
    }
    onChangeIndex(index: number) {
        this.index = index;
        this.forceUpdate();
    }
    async onSort(sort: string) {
        this.sort = sort;
        if (typeof this.props.onChange == 'function') this.props.onChange({ sort });
        await this.loadComment();
    }
    async loadComment() {
        if (this.elementUrl) {
            this.loading = true;
            this.forceUpdate();
            try {
                var r = await channel.get('/ws/comment/list', {
                    elementUrl: this.elementUrl,
                    parentId: null,
                    sort: this.sort as any,
                    page: this.index,
                    size: this.size,
                    ws: this.props?.ws,
                });
                if (r.ok) {
                    this.list = r.data.list;
                    this.total = r.data.total;
                }
            }
            catch (ex) {

            }
            finally {
                this.loading = false;
                this.forceUpdate()
            }
        }
    }
    spread: boolean = false;
    onMentionUser(event: React.MouseEvent) {
        var el = event.target as HTMLElement;
        var u = el.closest('[data-userid]') as HTMLLinkElement;
        if (u) {
            var mentionUserid = u.getAttribute('data-userid');
            if (mentionUserid) {
                event.stopPropagation();
                useUserCard({ roundArea: Rect.fromEle(u) }, { userid: mentionUserid });
            }
        }
    }
    renderAllComments(comments: WsCommentType[], deep: number = 0) {
        return <div onMouseDown={e => this.onMentionUser(e)}>{comments.map((l, i) => {
            return <div key={l.id} className={"flex-top " + (i == comments.length - 1 ? "" : "gap-b-10")}>
                <UserBox userid={l.creater}>{(user) => <>
                    <div className="flex-fixed"><Avatar className="flex-fixed" size={24} user={user}></Avatar></div>
                    <div className={"flex-auto gap-l-10  " + (deep > 0 ? "" : " gap-b-5 padding-b-5 border-bottom-light")}>
                        <div className="visible-hover">
                            <div className="flex">
                                <span className="flex-auto  flex" >
                                    <span className="f-14 text-1 bold">{user.name}</span>
                                    <span className="flex-fixed f-12 remark  gap-l-10 ">{util.showTime(l.createDate)}</span>
                                    <span onMouseDown={e => this.onProperty(l, e)} className="visible size-20 flex-fixed gap-l-5 flex-center  item-hover cursor round remark"><Icon size={18} icon={DotsSvg}></Icon></span>
                                </span>
                                <span className="flex flex-fixed">
                                    <span className="f-12 cursor text-1 item-hover padding-w-3 l-16 round" onClick={e => this.onReply(l, user, e)}><S>回复</S></span>
                                    <span className={"flex-center gap-l-5 round cursor remark f-12 " + (l.like?.exists ? "fill-p" : "")} onClick={e => this.likeComment(l)}><Icon size={13} icon={LikeSvg}></Icon>{(l.like?.count || "") && <span className="gap-l-3">{l.like?.count || ""}</span>}</span>
                                </span>
                            </div>
                            <div className="text f-14" dangerouslySetInnerHTML={{ __html: l.text }}></div>
                        </div>
                        {l.replyCount > 0 && <div className=" flex">
                            <span onMouseDown={e => this.onExpends(l)} className="flex item-hover-light l-16 padding-l-3  cursor">
                                <span className={"remark  f-12 "}><Sp text={'{count}条回复'} data={{ count: l.replyCount }}>{l.replyCount}条回复</Sp></span>
                                <span className={"remark  flex-center  round ts " + (l.spread == true ? "angle-90-" : "")}><Icon size={14} icon={{ name: 'bytedance-icon', code: 'down' }}></Icon></span>
                            </span>
                        </div>}
                        {l.replys && l.spread == true && <div className="gap-t-10">{this.renderAllComments(l.replys.list, deep + 1)}</div>}
                    </div></>}
                </UserBox>
            </div>
        })}</div>
    }
    inputChatBox: InputChatBox;
    async onInput(data: ChatInputType) {
        this.addComment(data);
    }
    renderSendComment() {
        return <div className="padding-5 round-8 border-light ">
            <InputChatBox
                userid={this.userid}
                ws={this.props.ws}
                placeholder={lst("发表评论...")}
                ref={e => this.inputChatBox = e}
                onChange={e => this.onInput(e)}
                disabledRobot={true}
                disabledTextStyle={true}
                disabledUploadFiles={true}
                disabledInputQuote={true}
                display="comment"
            ></InputChatBox>
        </div>
    }
    isOver: boolean = false;
    onFocus(e) {
        this.spread = true;
        this.forceUpdate();
    }
    onFocusInput(){
        if(this.inputChatBox){
            this.inputChatBox.onFocus()
        }
    }
    onBlur(e) {
        if (this.isOver) return;
        this.spread = false;
        this.forceUpdate();
    }
    render() {
        return <div>
            {this.total > 0 && <div className="flex gap-t-5 ">
                <span className="bold f-14 flex-fixed">{this.total == 0 ? lst("评论") : lst('{total}条评论', { total: this.total })}</span>
                <div className="flex-auto flex-end f-12">
                    <em onMouseDown={e => this.onSort('default')} className={"h-24 flex-center cursor round padding-w-5" + (this.sort == 'default' ? " item-hover-focus" : "")}><S>默认</S></em>
                    <em onMouseDown={e => this.onSort('date')} className={"h-24 flex-center cursor round padding-w-5" + (this.sort == 'date' ? " item-hover-focus" : "")}><S>最新</S></em>
                </div>
            </div>}
            {this.list.length > 0 && <><Divider></Divider>
                <div className="padding-t-10 round min-h-30 " style={{
                    maxHeight: this.props.contentHeight,
                    overflowY: typeof this.props.contentHeight == 'number' ? "auto" : undefined,
                    marginBottom: typeof this.props.contentHeight == 'number' ? 10 : undefined,
                    paddingRight: typeof this.props.contentHeight == 'number' ? 10 : undefined,
                }}>
                    <SpinBox spin={this.loading}>
                        {this.renderAllComments(this.list)}
                        <Pagination size={this.size} total={this.total} index={this.index}></Pagination>
                    </SpinBox>
                </div></>}
            {this.renderSendComment()}
        </div>
    }
    componentDidMount(): void {
        if (typeof this.props.sort == 'string') this.sort = this.props.sort;
        if (typeof this.props.userid == 'string') this.userid = this.props.userid;
        if (typeof this.props.elementUrl == 'string') this.elementUrl = this.props.elementUrl;
        this.loadComment();
    }
}

