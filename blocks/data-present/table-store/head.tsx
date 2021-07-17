import { Block } from "../../../src/block";
import { BlockView } from "../../../src/block/view";
import { BlockAppear, BlockDisplay } from "../../../src/block/partial/enum";
import { url, view } from "../../../src/block/factory/observable";
import React from "react";
import { ChildsArea } from "../../../src/block/partial/appear";
import { TableStore } from "./table";
import plus from "../../../src/assert/svg/plus.svg";
import { Icon } from "../../../src/component/icon";
@url('/tablestore/head')
export class TableStoreHead extends Block {
    appear = BlockAppear.layout;
    display = BlockDisplay.block;
    get isRow() { return true }
    partName = 'head';
    get tableStore(): TableStore {
        return this.parent as TableStore;
    }
}
@view('/tablestore/head')
export class TableStoreHeadView extends BlockView<TableStoreHead>{
    render() {
        return <div className='sy-tablestore-head' >
            <ChildsArea childs={this.block.blocks.childs} />
            <div className='sy-tablestore-head-th'
                style={{ width: 100 }} onClick={e => this.block.tableStore.onAddColumn()}>
                <Icon icon={plus}></Icon>
            </div>
        </div>
    }
}