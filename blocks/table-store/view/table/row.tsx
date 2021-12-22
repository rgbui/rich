import { Block } from "../../../../src/block";
import { BlockView } from "../../../../src/block/view";
import { BlockDisplay } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import React from 'react';
import { ChildsArea } from "../../../../src/block/view/appear";
import { TableStore } from "./table";
import { TableStoreCell } from "./cell";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
@url('/tablestore/row')
export class TableStoreRow extends Block {
    display = BlockDisplay.block;
    get isRow() { return true }
    partName = 'row';
    get tableStore(): TableStore {
        return this.parent as TableStore;
    }
    dataRow: Record<string, any>;
    async createCells() {
        this.blocks.childs = [];
        var cols = this.tableStore.fields;
        for (let i = 0; i < cols.length; i++) {
            var cell = await BlockFactory.createBlock('/tablestore/cell', this.page, {}, this) as TableStoreCell;
            this.blocks.childs.push(cell);
            await cell.createCellContent();
        }
    }
    async createCell(at: number) {
        var cell = await BlockFactory.createBlock('/tablestore/cell', this.page, {}, this) as TableStoreCell;
        this.blocks.childs.insertAt(at, cell);
        await cell.createCellContent();
    }
    async deleteCell(at: number) {
        await (this.blocks.childs[at] as Block).delete();
    }
    get handleBlock(): Block {
        return this;
    }
}
@view('/tablestore/row')
export class TableRowView extends BlockView<TableStoreRow>{
    render() {
        return <div className='sy-tablestore-body-row'>
            <ChildsArea childs={this.block.childs}></ChildsArea>
            <div className='sy-tablestore-body-row-cell' style={{ width: 100 }}></div>
        </div>
    }
}