import { Block } from "../..";
import { BaseComponent } from "../../base/component";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { prop, url, view } from "../../factory/observable";
import React from "react";
import { ChildsArea, TextArea } from "../../base/appear";
import { TableStore } from "./table";
import { TextEle } from "../../../common/text.ele";
import plus from "../../../assert/svg/plus.svg";
import { Icon } from "../../../component/icon";
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
export class TableStoreHeadView extends BaseComponent<TableStoreHead>{
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