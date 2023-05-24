import { assignWith } from "lodash";
import React from "react";
import { useUserComments } from ".";
import { CopyText } from "../../component/copy";
import { ShyAlert } from "../../component/lib/alert";
import { TrashSvg, ReportSvg, DuplicateSvg, DotsSvg, LikeSvg, OpposeSvg, EmojiSvg } from "../../component/svgs";
import { Avatar } from "../../component/view/avator/face";
import { UserBox } from "../../component/view/avator/user";
import { Button } from "../../component/view/button";
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
import { useOpenEmoji } from "../emoji";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";

export class CommentListView extends React.Component<{
    userid: string;
    elementUrl: string;
    sort?: 'default' | 'date',
    onChange?: (props: Record<string, any>) => void
}>{
    list: Record<string, any>[] = [];
    total = 0;
    index = 1;
    size = 30;
    sort = 'default';
    userid: string;
    elementUrl: string;
    loading: boolean = false;
    pop: boolean = false;
    async likeComment(l) {
        var r = await channel.put('/ws/comment/emoji', {
            elementUrl: getElementUrl(ElementType.WsCommentEmoji, l.id, 'like')
        });
        if (r.ok) {
            l.like.count = r.data.count;
            this.forceUpdate()
        }
    }
    async unlikeComment(l) {
        var c = await channel.put('/ws/comment/emoji', {
            elementUrl: getElementUrl(ElementType.WsCommentEmoji, l.id, 'unlike'),
        });
        if (c.ok) {
            if (typeof l.unlike == 'undefined') l.unlike = { count: 0 };
            l.unlike.count = c.data.count;
            this.forceUpdate()
        }
    }
    async onReply(l, user, event: React.MouseEvent) {
        var g = await useUserComments({ userid: this.userid, placeholder: '回复@' + user.name });
        if (g) {
            var r = await channel.put('/ws/comment/send', {
                elementUrl: this.elementUrl,
                parentId: l.id,
                rootId: l.rootId,
                content: g
            });
            if (r.ok) {
                if (typeof l.replyCount != 'number') l.replyCount = 0;
                l.replyCount += 1;
                this.forceUpdate()
            }
        }
    }
    async onProperty(l, event: React.MouseEvent) {
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, [
            { name: 'del', visible: this.userid == l.creater, text: '删除', icon: TrashSvg },
            // { name: 'unlike', text: '踩评论', icon: OpposeSvg },
            { type: MenuItemType.divide },
            { name: 'report', disabled: true, text: '举报', icon: ReportSvg },
            { name: 'copy', text: '复制', icon: DuplicateSvg },
        ]);
        if (r?.item) {
            if (r.item.name == 'del') {
                await channel.del('/ws/comment/del', { id: l.id });
                this.list.remove(g => g.id == l.id);
                if (!l.parentId) { this.total -= 1; this.count -= 1; }
                this.forceUpdate()
            }
            else if (r.item.name == 'report') {

            }
            else if (r.item.name == 'unlike') {

            }
            else if (r.item.name == 'copy') {
                CopyText(l.content);
                ShyAlert('复制成功')
            }
        }
    }
    async addComment(event: React.MouseEvent) {
        event.preventDefault();
        var value = this.textarea.value;
        if (value) {
            this.textarea.value = '';
            var r = await channel.put('/ws/comment/send', {
                elementUrl: this.elementUrl,
                parentId: null,
                rootId: null,
                content: value
            });
            if (r.ok) {
                this.list.push(r.data.data);
                this.total += 1;
                this.count += 1;
                this.forceUpdate()
            }
        }
    }
    async onOpenEmjoji(event: React.MouseEvent) {
        this.isOver = true;
        var s = this.textarea.selectionStart;
        var e = this.textarea.selectionEnd;
        if (s > e) [s, e] = [e, s];
        var r = await useOpenEmoji({ roundArea: Rect.fromEvent(event) });
        if (r?.code) {
            var val = this.textarea.value;
            var nv = val.slice(0, s) + r.code + val.slice(e);
            this.textarea.value = nv;
            var pos = s + r.code.length
            setTimeout(() => {
                this.textarea.focus();
                this.textarea.setSelectionRange(pos, pos);
                this.isOver = false;
            }, 100);
        }
    }
    async onExpends(l) {
        var r = await channel.get('/ws/comment/list', {
            elementUrl: this.elementUrl,
            parentId: l.id,
            sort: 'date',
            page: 1,
            size: 200
        });
        if (r?.ok) {
            l.replys = r.data;
            this.forceUpdate();
        }
    }
    onChangeIndex(index: number) {
        this.index = index;
        this.forceUpdate();
    }
    onCancel() {
        this.textarea.value = '';
    }
    async onSet(sort: string) {
        this.sort = sort;
        if (typeof this.props.onChange == 'function') this.props.onChange({ sort });
        await this.loadComment();
    }
    async loadComment() {
        this.loading = true;
        this.forceUpdate();
        try {
            var r = await channel.get('/ws/comment/list', {
                elementUrl: this.elementUrl,
                parentId: null,
                sort: this.sort as any,
                page: this.index,
                size: this.size
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
    textarea: HTMLTextAreaElement;
    spread: boolean = false;
    renderComments(comments, deep: number = 0) {
        return comments.map(l => {
            return <div key={l.id} className={"flex-top gap-b-15"}>
                <UserBox userid={l.creater}>{(user) => <>
                    <div className="flex-fixed"> <Avatar className="flex-fixed" size={deep > 0 ? 24 : 32} user={user}></Avatar></div>
                    <div className={"flex-auto gap-l-10  " + (deep > 0 ? "" : " padding-b-10 border-bottom")}>
                        <div className="visible-hover">
                            <div className="flex"><span className="flex-auto f-14 bold" >{user.name}</span>
                                <span onMouseDown={e => this.onProperty(l, e)} className="visible size-24 flex-fixed flex-center flex-line item-hover cursor round text-1"><Icon size={18} icon={DotsSvg}></Icon></span></div>
                            <div className="text">{l.text}</div>
                            <div className="flex">
                                <div className="flex-auto flex flex-inline">
                                    <span className="f-12 remark  gap-r-10 ">{util.showTime(l.createDate)}</span>
                                    <span className="h-24 padding-w-5 gap-r-10 item-hover flex-center round cursor remark f-12" onClick={e => this.likeComment(l)}><Icon size={16} icon={LikeSvg}></Icon>{l.like?.count || ""}</span>
                                    <span className="h-24 padding-w-5  gap-r-10 item-hover flex-center round cursor remark f-12" onClick={e => this.unlikeComment(l)}><Icon size={16} icon={OpposeSvg}></Icon>{l.unlike?.count || ""}</span>
                                    <span className="h-24 gap-r-10 padding-w-5 item-hover flex-center round cursor remark f-12" onClick={e => this.onReply(l, user, e)}>
                                        {/* <Icon size={16} icon={CommentSvg}></Icon> */}
                                        回复</span>
                                </div>
                                <div className="flex-fixed flex-end">

                                </div>
                            </div>
                        </div>
                        {l.replyCount > 0 && !l.replys && <div className="flex gap-t-10">
                            <span className="link cursor f-12" onMouseDown={e => this.onExpends(l)}>展开回复{l.replyCount}条</span>
                        </div>}
                        {l.replys && <div className="gap-t-10">{this.renderComments(l.replys.list, deep + 1)}</div>}
                    </div></>}
                </UserBox>
            </div>
        })
    }
    isOver: boolean = false;
    onFocus(e) {
        this.spread = true;
        this.forceUpdate();
    }
    onBlur(e) {
        if (this.isOver) return;
        this.spread = false;
        this.forceUpdate();
    }
    render() {
        return <div className={this.pop ? "w-600 padding-w-14" : ""}>
            <div className="flex gap-b-10 gap-t-5 ">
                <span className="bold f-14 flex-fixed">{this.total == 0 ? "" : (this.total + "条")}评论</span>
                <div className="flex-auto flex-end f-12">
                    <em onMouseDown={e => this.onSet('default')} className={"h-24 flex-center cursor round padding-w-5" + (this.sort == 'default' ? " item-hover-focus" : "")}>默认</em>
                    <em onMouseDown={e => this.onSet('date')} className={"h-24 flex-center cursor round padding-w-5" + (this.sort == 'date' ? " item-hover-focus" : "")}>最新</em>
                </div>
            </div>
            {this.list.length > 0 && <Divider></Divider>}
            <div className="padding-h-10   round min-h-30 overflow-y">
                <SpinBox spin={this.loading}> {this.renderComments(this.list)}
                    <Pagination size={this.size} total={this.total} index={this.index}></Pagination>
                    {this.list.length == 0 && <div className="remark min-50 flex-center">暂无评论</div>}
                </SpinBox>
            </div>
            <div className="gap-b-15">
                <Divider></Divider>
                <div className="flex-top  padding-w-14 gap-t-10">
                    {this.userid && <Avatar className="flex-fixed" size={32} userid={this.userid}></Avatar>}
                    <div tabIndex={1}
                        onFocus={e => this.onFocus(e)}
                        onBlur={e => this.onBlur(e)}
                        className="flex-auto gap-l-10 border round padding-10"
                        style={{ height: this.spread ? 92 : 24 }}
                    >
                        <textarea
                            className="ef"
                            style={{
                                width: '100%',
                                lineHeight: "24px",
                                border: 'none',
                                padding: 0,
                                height: this.spread ? 50 : 24,
                                resize: 'none'
                            }}
                            placeholder="评论千万条，友善第一条"
                            ref={e => this.textarea = e}></textarea>
                        {this.spread && <><Divider></Divider>
                            <div className="flex">
                                <div className="flex-auto">
                                    <span onMouseDown={e => this.onOpenEmjoji(e)} className="size-24 flex-center round item-hover"><Icon size={18} icon={EmojiSvg}></Icon></span>
                                </div>
                                <span className="flex-fixed flex">
                                    <Button size="small" onMouseDown={e => this.addComment(e)}>发布</Button>
                                </span>
                            </div></>}
                    </div>
                </div>
            </div>
        </div>
    }
    componentDidMount(): void {
        if (typeof this.props.sort == 'string') this.sort = this.props.sort;
        if (typeof this.props.userid == 'string') this.userid = this.props.userid;
        if (typeof this.props.elementUrl == 'string') this.elementUrl = this.props.elementUrl;
        this.loadComment();
    }
    async open(props: {
        userid: string;
        elementUrl: string;
        sort?: 'default' | 'date',
    }) {
        this.pop = true;
        this.count = 0;
        this.userid = props.userid;
        this.elementUrl = props.elementUrl;
        this.sort = props.sort;
        await this.loadComment();
        this.forceUpdate()
    }
    count: number = 0;
}

export async function useCommentListView(props: {
    userid: string;
    elementUrl: string;
    sort?: 'default' | 'date',
}) {
    var pos: PopoverPosition = { center: true };
    let popover = await PopoverSingleton(CommentListView, { mask: true, shadow: true });
    let fv = await popover.open(pos);
    fv.open(props);
    return new Promise((resolve: (count: number) => void, reject) => {
        popover.only('close', () => {
            resolve(fv.count)
        });
    })
}