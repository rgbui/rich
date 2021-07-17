import { BlockView } from "../../../src/block/view";
import React from 'react';
import { url, view } from "../../../src/block/factory/observable";
import { ChildsArea } from "../../../src/block/partial/appear";
import { BlockAppear, BlockDisplay } from "../../../src/block/partial/enum";
import { Block } from "../../../src/block";
import { TableStoreRow } from "./row";
import { TableStore } from "./table";

@url('/tablestore/cell')
export class TableStoreCell extends Block {
    display = BlockDisplay.block;
    appear = BlockAppear.layout;
    name: string;
    partName = 'cell';
    get tableRow(): TableStoreRow {
        return this.parent as TableStoreRow;
    }
    get tableStore(): TableStore {
        return this.tableRow.tableStore;
    }
    get field() {
        return this.tableStore.fields.find(g => g.name == this.name);
    }
    async createCellContent() {
        // this.blocks.childs = [];
        // var cellContent: Block;
        // switch (this.metaCol.type) {
        //     case TableMetaFieldType.string:
        //         cellContent = await BlockFactory.createBlock(BlockUrlConstant.Text, this.page, { content: this.value }, this);
        //         break;
        //     case TableMetaFieldType.number:
        //         cellContent = await BlockFactory.createBlock('/text', this.page, { content: this.value }, this);
        //         break;
        // }
        // if (cellContent)
        //     this.blocks.childs.push(cellContent);
    }
    get isCol() {
        return true;
    }
}
@view('/tablestore/cell')
export class TableStoreCellView extends BlockView<TableStoreCell>{
    render() {
        return <div className='sy-tablestore-body-row-cell' ref={e => this.block.childsEl = e}
            style={{ width: this.block.field.width }}>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}