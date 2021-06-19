import { Block } from "../../src/block";
import { BlockView } from "../../src/block/view";
import { BlockAppear, BlockDisplay } from "../../src/block/partial/enum";
import { url, view } from "../../src/block/factory/observable";
import React from 'react';
import { ChildsArea } from "../../src/block/partial/appear";
import { TableStore } from "./table";
import { TableStoreCell } from "./cell";
import { BlockFactory } from "../../src/block/factory/block.factory";
@url('/tablestore/row')
export class TableStoreRow extends Block {
    appear = BlockAppear.layout;
    display = BlockDisplay.block;
    get isRow() { return true }
    partName = 'row';
    get tableStore(): TableStore {
        return this.parent as TableStore;
    }
    dataRow: Record<string, any>;
    async createCells() {
        this.blocks.childs = [];
        var cols = this.tableStore.cols;
        for (let i = 0; i < cols.length; i++) {
            let col = cols[i];
            var cell = await BlockFactory.createBlock('/tablestore/cell', this.page, { name: col.name }, this) as TableStoreCell;
            this.blocks.childs.push(cell);
            await cell.createCellContent();
        }
    }
    async appendCell(at: number) {
        var col = this.tableStore.cols[at];
        var cell = await BlockFactory.createBlock('/tablestore/cell', this.page, { name: col.name }, this) as TableStoreCell;
        this.blocks.childs.push(cell);
        await cell.createCellContent();
    }
}
@view('/tablestore/row')
export class TableRowView extends BlockView<TableStoreRow>{
    render() {
        return <div className='sy-tablestore-body-row'>
            <ChildsArea childs={this.block.childs}></ChildsArea>
            <div className='sy-tablestore-body-row-cell' style={{ width: 100 }}>

            </div>
        </div>
    }
}