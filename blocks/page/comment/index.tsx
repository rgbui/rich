import React from "react";
import { CopyText } from "../../../component/copy";
import { ShyAlert } from "../../../component/lib/alert";
import { CommentSvg, DotsSvg, DuplicateSvg, EmojiSvg, LikeSvg, OpposeSvg, PropertysSvg, ReportSvg, TrashSvg } from "../../../component/svgs";
import { Avatar } from "../../../component/view/avator/face";
import { UserBox } from "../../../component/view/avator/user";
import { Button } from "../../../component/view/button";
import { Divider } from "../../../component/view/grid";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import { Pagination } from "../../../component/view/pagination";
import { SpinBox } from "../../../component/view/spin";
import { useOpenEmoji } from "../../../extensions/emoji";
import { channel } from "../../../net/channel";
import { ElementType, getElementUrl } from "../../../net/element.type";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import { util } from "../../../util/util";


@url('/comments')
export class Comment extends Block {
    list: Record<string, any>[] = [];
    total = 0;
    index = 1;
    size = 30;
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
            console.log(r, 'ggg');
            if (r.ok) {
                this.list = r.data.list;
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
        return getElementUrl(ElementType.PageItem, this.page.id);
    }
    loading: boolean = false;
}

@view('/comments')
export class CommentView extends BlockView<Comment>{
    renderComments() {
        return this.block.list.map(l => {
            return <div key={l.id} className="flex-top gap-b-15">
                <UserBox userid={l.creater}>{(user) => <>
                    <div className="flex-fixed"> <Avatar className="flex-fixed" size={24} user={user}></Avatar></div>
                    <div className="flex-auto gap-l-10">
                        <div className="flex"><span className="flex-auto f-14 bold" >{user.name}</span><span onMouseDown={e => this.onProperty(l, e)} className="size-24 flex-fixed flex-center flex-line item-hover cursor round text-1"><Icon size={18} icon={DotsSvg}></Icon></span></div>
                        <div className="text">{l.text}</div>
                        <div className="flex">
                            <div className="flex-auto flex flex-inline"><span className="f-12 remark">{util.showTime(l.createDate)}</span></div>
                            <div className="flex-fixed flex-end">
                                <span className="h-24 gap-r-10 padding-w-5 item-hover flex-center round cursor text-1" onClick={e => this.onReply(l, e)}><Icon size={16} icon={CommentSvg}></Icon>回复</span>
                                <span className="h-24 padding-w-5 item-hover flex-center round cursor text-1" onClick={e => this.likeComment(l)}><Icon size={16} icon={LikeSvg}></Icon>{l.like?.count || ""}</span>
                            </div>
                        </div>
                    </div></>}
                </UserBox>
            </div>
        })
    }
    async likeComment(l) {
        var r = await channel.put('/ws/comment/emoji', { elementUrl: getElementUrl(ElementType.WsCommentEmoji, l.id, 'like') });
        if (r.ok) {
            l.like.count = r.data.count;
            this.block.forceUpdate()
        }
    }
    async onReply(l, event: React.MouseEvent) {

    }
    async onProperty(l, event: React.MouseEvent) {
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, [
            { name: 'del', visible: this.block.page.user?.id == l.creater, text: '删除', icon: TrashSvg },
            { name: 'unlike', text: '踩评论', icon: OpposeSvg },
            { type: MenuItemType.divide },
            { name: 'report', disabled: true, text: '举报', icon: ReportSvg },
            { name: 'copy', text: '复制', icon: DuplicateSvg },
        ]);
        if (r?.item) {
            if (r.item.name == 'del') {
                await channel.del('/ws/comment/del', { id: l.id });
            }
            else if (r.item.name == 'report') {

            }
            else if (r.item.name == 'unlike') {
                var c = await channel.put('/ws/comment/emoji', {
                    elementUrl: getElementUrl(l.id, 'unlike'),
                });
                if (c.ok) {
                    if (typeof l.unlike == 'undefined') l.unlike = { count: 0 };
                    l.unlike.count = c.data.count;
                }
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
            }
        }
    }
    async onOpenEmjoji(event: React.MouseEvent) {
        event.preventDefault();
        var r = await useOpenEmoji({ roundArea: Rect.fromEvent(event) });

    }
    onChangeIndex(index: number) {
        this.block.index = index;
        this.forceUpdate();
    }
    onCancel() {
        this.textarea.value = '';
    }
    textarea: HTMLTextAreaElement;
    spread: boolean = false;
    render() {
        return <div style={this.block.visibleStyle}>
            <div style={this.block.contentStyle}>
                <div className="flex gap-b-10">
                    <span className="bold f-14 flex-fixed">{this.block.total == 0 ? "" : (this.block.total + "条")}评论</span>
                    <div className="flex-auto flex-end f-12">
                        <em className={"h-24 flex-center cursor round padding-w-5" + (this.block.sort == 'default' ? " item-hover-focus" : "")}>默认</em>
                        <em className={"h-24 flex-center cursor round padding-w-5" + (this.block.sort == 'date' ? " item-hover-focus" : "")}>最新</em>
                    </div>
                </div>
                <div className="gap-b-15">
                    <div className="flex-top">
                        <Avatar className="flex-fixed" size={40} user={this.block.page.user}></Avatar>
                        <div tabIndex={1} onFocus={e => {
                            this.spread = true;
                            this.forceUpdate();
                        }}
                            onBlur={e => {
                                this.spread = false;
                                this.forceUpdate();
                            }}
                            className="flex-auto gap-l-10 border round padding-10"
                            style={{ height: this.spread ? 102 : 24 }}
                        >
                            <textarea
                                className="ef"
                                style={{ width: '100%', lineHeight: "24px", border: 'none', padding: 0, height: this.spread ? 50 : 24 }}
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
                <div className="border padding-15 round">
                    <SpinBox spin={this.block.loading}> {this.renderComments()}
                        <Pagination size={this.block.size} total={this.block.total} index={this.block.index}></Pagination>
                        {this.block.list.length == 0 && <div className="remark min-50 flex-center">暂无评论</div>}
                    </SpinBox>
                </div>
            </div>
        </div>
    }
}