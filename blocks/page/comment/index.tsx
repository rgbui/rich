import React from "react";
import { CopyText } from "../../../component/copy";
import { ShyAlert } from "../../../component/lib/alert";
import { CommentSvg, LikeSvg, PropertysSvg } from "../../../component/svgs";
import { Avatar } from "../../../component/view/avator/face";
import { UserBox } from "../../../component/view/avator/user";
import { Button } from "../../../component/view/button";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Pagination } from "../../../component/view/pagination";
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
    size = 1;
    async loadComment() {
        this.loading = true;
        this.forceUpdate();
        try {
            var r = await channel.get('/ws/comment/list', {
                elementUrl: this.getCommentElementUrl(),
                parentId: null,
                sort: 'default',
                page: this.index,
                size: this.size
            });
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
    didMount() {
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
            return <div key={l.id} className="sy-block-comment">
                <UserBox userid={l.userid}>{(user) => <><div className="flex-top"><Avatar className="flex-fixed" size={40} userid={l.userid}></Avatar></div>
                    <div className="flex-auto gap-l-10">
                        <div className="flex"><span className="flex-auto" ></span><span className="size-20 flex-fixed flex-center flex-line item-hover cursor"><Icon icon={PropertysSvg}></Icon></span></div>
                        <div className="text">{l.content}</div>
                        <div className="flex">
                            <div className="flex-auto flex flex-line"><span>{util.showTime(l.createDate)}</span></div>
                            <div className="flex-fixed flex-end">
                                <span onClick={e => this.likeComment(l)}><Icon size={16} icon={LikeSvg}></Icon>{l.like?.count || ""}</span>
                                <span onClick={e => this.onReply(l, e)}><Icon size={16} icon={CommentSvg}></Icon>评论{this.block.total}</span>
                                <span onClick={e => this.onProperty(l, e)}><Icon size={16} icon={PropertysSvg}></Icon></span>
                            </div>
                        </div>
                    </div></>}</UserBox>
            </div>
        })
    }
    async likeComment(l)
    {
        var r = await channel.put('/ws/comment/emoji', { elementUrl: getElementUrl(ElementType.WsCommentEmoji, l.id, 'like') });
        if (r.ok)
        {
            l.like.count = r.data.count;
            this.block.forceUpdate()
        }
    }
    async onReply(l, event: React.MouseEvent) {

    }
    async onProperty(l, event: React.MouseEvent) {
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, [
            { name: 'del', text: '删除' },
            { name: 'unlike', text: '踩评论' },
            { name: 'report', disabled: true, text: '举报' },
            { name: 'copy', text: '复制' },
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
    async addComment() {
        var value = this.textarea.value;
        this.textarea.value = '';
        var r = await channel.put('/ws/comment/send', {
            elementUrl: this.block.getCommentElementUrl(),
            parentId: null,
            rootId: null,
            content: value
        });
    }
    onChangeIndex(index: number) {
        this.block.index = index;
        this.forceUpdate();
    }
    onCancel() {
        this.textarea.value = '';
    }
    textarea: HTMLTextAreaElement;
    render() {
        return <div className="sy-block-comments">
            <div className="flex">
                <span className="bold f-14">评论</span>
                <span></span>
            </div>
            <div className="sy-block-comments-list">
<<<<<<< HEAD
                {this.block.loading && <Loading></Loading>}
                {this.renderComments()}
                <Pagination size={this.block.size} total={this.block.total} index={this.block.index}></Pagination>
                {this.block.list.length == 0 && <div className="remark"></div>}
=======
                <SpinBox spin={this.block.loading}>
                    {this.renderComments()}
                    {this.block.list.length == 0 && <div className="remark"></div>}
                </SpinBox>
>>>>>>> 5124036f891312c0489c25a22e28b3ce64eb83e9
            </div>
            <div className="sy-block-comments-input">
                <div className="flex">
                    <Avatar className="flex-fixed" size={40} user={this.block.page.user}></Avatar>
                    <div className="flex-auto">
                        <textarea ref={e => this.textarea = e}></textarea>
                        <div className="flex">
                            <div className="flex-fixed"></div>
                            <span className="flex-auto">
                                <Button className="gap-l-10" onClick={e => this.onCancel()} ghost>取消</Button>
                                <Button onClick={e => this.addComment()}>评论</Button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}