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
        return this.block.list.map(l =>{
            return <div className="sy-block-comment">
                <UserBox userid={l.userid}>{(user) => <><div className="flex-top"><Avatar className="flex-fixed" size={40} userid={l.userid}></Avatar></div>
                    <div className="flex-auto gap-l-10">
                        <div className="flex"><span className="flex-auto" ></span><span className="size-20 flex-fixed flex-center flex-line item-hover cursor"><Icon icon={PropertysSvg}></Icon></span></div>
                        <div className="text">{l.content}</div>
                        <div className="flex">
                            <div className="flex-auto flex flex-line"><span>{util.showTime(l.createDate)}</span></div>
                            <div className="flex-fixed flex-end flex-line"><span>回复</span></div>
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