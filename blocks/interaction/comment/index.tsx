import React from "react";
import { CommentListView } from "../../../extensions/comment/list";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { MenuItem} from "../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../src/block/enum";
import { Point } from "../../../src/common/vector/point";
import { util } from "../../../util/util";
import lodash from "lodash";

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
    @prop()
    displayFormat: 'comment' | 'answer' | 'discuss' = 'comment';
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var ns: MenuItem<string | BlockDirective>[] = [];
        var at = rs.findIndex(g => g.name == 'color');
        rs.splice(at, 0, ...ns);
        lodash.remove(rs, g => g.name == BlockDirective.copy);
        lodash.remove(rs, g => g.name == BlockDirective.comment);
        return rs;
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>) {
        if (item.name == 'displayFormat') {
            await this.onUpdateProps({ displayFormat: item.value }, { range: BlockRenderRange.self })
            return;
        }
        await super.onContextMenuInput(item);
    }
    getVisibleHandleCursorPoint(): Point {
        var bound = this.getVisibleContentBound()
        if (bound) {
            var pos = Point.from(bound);
            pos = pos.move(0, 8 + util.remToPx(this.page.lineHeight) / 2);
            return pos;
        }
    }
}

@view('/comments')
export class CommentView extends BlockView<Comment>{
    renderView() {
        return <div
            style={this.block.visibleStyle}
            onMouseDown={e => e.stopPropagation()}>
            <div style={this.block.contentStyle}>
                <CommentListView
                    page={this.props.block.page}
                    displayFormat={this.props.block.displayFormat || "comment"}
                    userid={this.props.block.page.user.id}
                    elementUrl={this.props.block.getCommentElementUrl()}
                    sort={this.props.block.sort as any}
                ></CommentListView>
            </div>
        </div>
    }

}