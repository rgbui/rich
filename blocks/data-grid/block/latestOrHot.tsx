import { CSSProperties, ReactNode } from "react";
import { Block } from "../../../src/block";
import { BlockDirective, BlockDisplay } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { DataGridView } from "../view/base";
import React from "react";
import { FieldType } from "../schema/type";
import { SelectButtons } from "../../../component/view/button/select";
import { lst } from "../../../i18n/store";
import { MenuItemType } from "../../../component/view/menu/declare";
import { Point, Rect } from "../../../src/common/vector/point";

@url('/data-grid/LatestOrHot')
export class LatestOrHot extends Block {
    display = BlockDisplay.block;
    @prop()
    align: 'left' | 'right' | 'center' = 'left';
    get refBlock() {
        return super.refBlock as DataGridView;
    }
    lasteOrHost: '' | 'latest' | 'hot' = '';
    getSort() {
        if (this.lasteOrHost == 'latest') {
            return {
                [FieldType[FieldType.createDate]]: -1
            }
        }
        else if (this.lasteOrHost == 'hot') {
            return {
                [FieldType[FieldType.like] + '.count']: -1,
                [FieldType[FieldType.love] + ".count"]: -1
            }
        }
    }
    async onSet(value: '' | 'latest' | 'hot') {
        if (this.lasteOrHost == value) {
            this.lasteOrHost = '';
        }
        else this.lasteOrHost = value;
        await this.forceUpdate();
        if (this.refBlock) {
            await this.refBlock.onSearch();
        }
    }
    async onGetContextMenus(this: Block) {
        var rs = await super.onGetContextMenus();
        var te = rs.find(c => c.name == 'text-center');
        te.text = lst('对齐');
        var cat = rs.findIndex(c => c.name == BlockDirective.delete);
        rs.splice(cat + 1,
            0,
            { type: MenuItemType.divide },
            {
                type: MenuItemType.help,
                url: window.shyConfig?.isUS ? "https://shy.red/ws/help/page/51" : "https://shy.live/ws/help/page/1879",
                text: lst('了解如何使用最新或最热块')
            }
        )
        return rs;
    }
    getVisibleHandleCursorPoint(): Point {
        var rect = Rect.fromEle(this.el.querySelector('.flex') as HTMLElement);
        if (rect) {
            return rect.leftMiddle;
        }
    }
}

@view('/data-grid/LatestOrHot')
export class LatestOrHotView extends BlockView<LatestOrHot>{
    renderView(): ReactNode {
        var style: CSSProperties =this.block.contentStyle;
        if (this.block.align == 'center') style.justifyContent = 'center';
        else if (this.block.align == 'right') style.justifyContent = 'flex-end';
        else style.justifyContent = 'flex-start';
        return <div style={this.block.visibleStyle}>
            <div className="flex" style={style}>
                <SelectButtons
                    value={this.block.lasteOrHost}
                    options={[
                        { text: lst('最新'), value: 'latest' },
                        { text: lst('最热'), value: 'hot' }
                    ]}
                    onChange={v => this.block.onSet(v)}
                ></SelectButtons>
            </div>
        </div>
    }
}
