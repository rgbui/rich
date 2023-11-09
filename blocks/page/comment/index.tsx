import React from "react";
import { CommentListView } from "../../../extensions/comment/list";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import { BlockDirective, BlockRenderRange } from "../../../src/block/enum";

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
        ns.push({
            name: 'displayFormat',
            text: lst('格式'),
            value: this.displayFormat,
            type: MenuItemType.select,
            icon: { name: 'bytedance-icon', code: 'refresh' },
            options: [
                { text: lst('评论'), value: 'comment' },
                { text: lst('回答'), value: 'answer' }
            ]
        }, { type: MenuItemType.divide })
        var at = rs.findIndex(g => g.name == 'color');
        rs.splice(at, 0, ...ns);
        return rs;
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>) {
        if (item.name == 'displayFormat') {
            await this.onUpdateProps({ displayFormat: item.value }, { range: BlockRenderRange.self })
            return;
        }
        await super.onContextMenuInput(item);
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
                    displayFormat={this.props.block.displayFormat}
                    userid={this.props.block.page.user.id}
                    elementUrl={this.props.block.getCommentElementUrl()}
                    sort={this.props.block.sort as any}
                ></CommentListView>
            </div>
        </div>
    }

}