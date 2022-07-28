import dayjs from "dayjs";
import React from "react";
import { PropertysSvg } from "../../../component/svgs";
import { Avatar } from "../../../component/view/avator/face";
import { UserBox } from "../../../component/view/avator/user";
import { Icon } from "../../../component/view/icon";
import { Loading } from "../../../component/view/loading";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { util } from "../../../util/util";

@url('/comments')
export class Comment extends Block {
    list: Record<string, any>[] = [];
    total = 0;
    index = 1;
    size = 1;
    async load() {
        this.loading = true;
        try {

        }
        catch (ex) {

        }
        finally {
            this.loading = false;
        }
    }
    didMount() {
        this.load()
    }
    loading: boolean = false;
    removeComment(id: string) {

    }
    addComment() {

    }
}
@view('/comments')
export class CommentView extends BlockView<Comment>{
    renderComments() {
        return this.block.list.map(l => {
            return <div className="sy-block-comment">
                <UserBox userid={l.userid}>{(user) => <><div className="sy-block-comment-user"><Avatar userid={l.userid}></Avatar></div>
                    <div className="sy-block-comment-body">
                        <div className="sy-block-comment-user"><span></span><span ><Icon icon={PropertysSvg}></Icon></span></div>
                        <div className="sy-block-comment-content">{l.content}</div>
                        <div className="sy-block-comment-operators">
                            <div><span>{util.showTime(l.createDate)}</span></div>
                            <div><span>回复</span></div>
                        </div>
                    </div></>}</UserBox>
            </div>
        })
    }
    render() {
        return <div className="sy-block-comments">
            <div className="sy-block-comments-list">
                {this.block.loading && <Loading></Loading>}
                {this.renderComments()}
            </div>
            <div className="sy-block-comments-input">

            </div>
        </div>
    }
}