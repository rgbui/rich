import React from "react";
import { CommentListView } from "../../../extensions/comment/list";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";

@url('/comments')
export class Comment extends Block {
    @prop()
    sort = 'default';
    getCommentElementUrl() {
        return this.page.elementUrl;
    }
    async getMd() {
        return '';
    }
}

@view('/comments')
export class CommentView extends BlockView<Comment>{
    renderView()  {
        return <div
            style={this.block.visibleStyle}
            onMouseDown={e => e.stopPropagation()}>
            <div style={this.block.contentStyle}>
                <CommentListView
                page={this.props.block.page}
                    userid={this.props.block.page.user.id}
                    elementUrl={this.props.block.getCommentElementUrl()}
                    sort={this.props.block.sort as any}
                    onChange={e => {

                    }}
                ></CommentListView>
            </div>
        </div>
    }

}