import React from "react";
import { CopyText } from "../../../component/copy";
import { ShyAlert } from "../../../component/lib/alert";
import { DotsSvg, DuplicateSvg, EmojiSvg, LikeSvg, OpposeSvg, ReportSvg, TrashSvg } from "../../../component/svgs";
import { Avatar } from "../../../component/view/avator/face";
import { UserBox } from "../../../component/view/avator/user";
import { Button } from "../../../component/view/button";
import { Divider } from "../../../component/view/grid";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import { Pagination } from "../../../component/view/pagination";
import { SpinBox } from "../../../component/view/spin";
import { useUserComments } from "../../../extensions/comment";
import { useOpenEmoji } from "../../../extensions/emoji";
import { channel } from "../../../net/channel";
import { ElementType, getElementUrl } from "../../../net/element.type";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import { util } from "../../../util/util";

@url('/comments')
export class Comment extends Block {
    list: Record<string, any>[] = [];
    total = 0;
    index = 1;
    size = 30;
    @prop()
    sort = 'default';
    async loadComment() {
        this.loading = true;
        this.forceUpdate();
        try {
            var r = await channel.get('/ws/comment/list', {
                elementUrl: this.getCommentElementUrl(),
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
    async didMounted() {
        this.loadComment()
    }
    getCommentElementUrl() {
        return this.page.elementUrl;
    }
    loading: boolean = false;
}

@view('/comments')
export class CommentView extends BlockView<Comment>{

    async likeComment(l) {
        var r = await channel.put('/ws/comment/emoji', {
            elementUrl: getElementUrl(ElementType.WsCommentEmoji, l.id, 'like')
        });
        if (r.ok) {
            l.like.count = r.data.count;
            this.block.forceUpdate()
        }
    }

    async unlikeComment(l) {
        var c = await channel.put('/ws/comment/emoji', {
            elementUrl: getElementUrl(ElementType.WsCommentEmoji, l.id, 'unlike'),
        });
        if (c.ok) {
            if (typeof l.unlike == 'undefined') l.unlike = { count: 0 };
            l.unlike.count = c.data.count;
            this.block.forceUpdate()
        }
    }

    async onReply(l, user, event: React.MouseEvent) {
        var g = await useUserComments({ userid: this.block.page.user?.id, placeholder: '回复@' + user.name });
        if (g) {
            var r = await channel.put('/ws/comment/send', {
                elementUrl: this.block.getCommentElementUrl(),
                parentId: l.id,
                rootId: l.rootId,
                content: g
            });
            if (r.ok) {
                if (typeof l.replyCount != 'number') l.replyCount = 0;
                l.replyCount += 1;
                this.block.forceUpdate()
            }
        }
    }
    async onProperty(l, event: React.MouseEvent) {
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, [
            { name: 'del', visible: this.block.page.user?.id == l.creater, text: '删除', icon: TrashSvg },
            // { name: 'unlike', text: '踩评论', icon: OpposeSvg },
            { type: MenuItemType.divide },
            { name: 'report', disabled: true, text: '举报', icon: ReportSvg },
            { name: 'copy', text: '复制', icon: DuplicateSvg },
        ]);
        if (r?.item) {
            if (r.item.name == 'del') {
                await channel.del('/ws/comment/del', { id: l.id });
                this.block.list.remove(g => g.id == l.id);
                this.block.forceUpdate()
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
                elementUrl: this.block.getCommentElementUrl(),
                parentId: null,
                rootId: null,
                content: value
            });
            if (r.ok) {
                this.block.list.push(r.data.data);
                this.block.forceUpdate()
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

                this.textarea.setSelectionRange(pos, pos); this.isOver = false;
            }, 100);
        }
        console.log('ggg');

    }

    async onExpends(l) {
        var r = await channel.get('/ws/comment/list', {
            elementUrl: this.block.getCommentElementUrl(),
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
        this.block.index = index;
        this.forceUpdate();
    }

    onCancel() {
        this.textarea.value = '';
    }

    async onSet(sort: string) {
        await this.block.onUpdateProps({ sort });
        await this.block.loadComment();
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
        return <div style={this.block.visibleStyle} onMouseDown={e => e.stopPropagation()}>
            <div style={this.block.contentStyle}>
                <div className="flex gap-b-10">
                    <span className="bold f-14 flex-fixed">{this.block.total == 0 ? "" : (this.block.total + "条")}评论</span>
                    <div className="flex-auto flex-end f-12">
                        <em onMouseDown={e => this.onSet('default')} className={"h-24 flex-center cursor round padding-w-5" + (this.block.sort == 'default' ? " item-hover-focus" : "")}>默认</em>
                        <em onMouseDown={e => this.onSet('date')} className={"h-24 flex-center cursor round padding-w-5" + (this.block.sort == 'date' ? " item-hover-focus" : "")}>最新</em>
                    </div>
                </div>
                <div className="gap-b-15">
                    <div className="flex-top">
                        <Avatar className="flex-fixed" size={32} user={this.block.page.user}></Avatar>
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
                                    height: this.spread ? 50 : 24
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
                <div className="padding-h-10 round">
                    <SpinBox spin={this.block.loading}> {this.renderComments(this.block.list)}
                        <Pagination size={this.block.size} total={this.block.total} index={this.block.index}></Pagination>
                        {this.block.list.length == 0 && <div className="remark min-50 flex-center">暂无评论</div>}
                    </SpinBox>
                </div>
            </div>
        </div>
    }

}