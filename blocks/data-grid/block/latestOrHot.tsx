import { CSSProperties, ReactNode } from "react";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { DataGridView } from "../view/base";
import React from "react";
import { FieldType } from "../schema/type";

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
}

@view('/data-grid/LatestOrHot')
export class LatestOrHotView extends BlockView<LatestOrHot>{
    renderView(): ReactNode {
        var style: CSSProperties = {};
        if (this.block.align == 'center') style.justifyContent = 'center';
        else if (this.block.align == 'right') style.justifyContent = 'flex-end';
        else style.justifyContent = 'flex-start';
        return <div style={this.block.visibleStyle}>
            <div className="flex" style={style}>
                <span style={{ borderRadius: '4px 0px 0px 4px' }} className={"cursor padding-w-10 padding-h-2 f-14 " + (this.block.lasteOrHost == 'latest' ? "bg-primary text-white" : "item-hover-focus")} onMouseDown={e => { e.stopPropagation(); this.block.onSet('latest') }}>最新</span>
                <span style={{ borderRadius: '0px 4px 4px 0px' }} className={"cursor padding-w-10 padding-h-2 f-14 " + (this.block.lasteOrHost == 'hot' ? "bg-primary text-white" : "item-hover-focus")} onMouseDown={e => { e.stopPropagation(); this.block.onSet('hot') }}>最热</span>
            </div>
        </div>
    }
}
