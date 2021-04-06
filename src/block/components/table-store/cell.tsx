import { BaseComponent } from "../../base/component";
import React from 'react';
import { prop, url, view } from "../../factory/observable";
import { ChildsArea, TextArea } from "../../base/appear";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { Block } from "../../base";
import { TableStoreRow } from "./row";
import { TableStore } from "./table";
import { TableMetaFieldType } from "./meta";
import { BlockFactory } from "../../factory/block.factory";
@url('/tablestore/cell')
export class TableStoreCell extends Block {
    display = BlockDisplay.block;
    appear = BlockAppear.layout;
    name: string;
    partName='cell';
    get tableRow(): TableStoreRow {
        return this.parent as TableStoreRow;
    }
    get tableStore(): TableStore {
        return this.tableRow.tableStore;
    }
    get col() {
        return this.tableStore.cols.find(g => g.name == this.name);
    }
    get metaCol() {
        return this.tableStore.meta.cols.find(g => g.name == this.name);
    }
    get value() {
        return this.tableRow.dataRow[this.name];
    }
    async createCellContent() {
        this.blocks.childs = [];
        var cellContent: Block;
        switch (this.metaCol.type) {
            case TableMetaFieldType.string:
                cellContent = await BlockFactory.createBlock('/text', this.page, { content: this.value }, this);
                break;
            case TableMetaFieldType.number:
                cellContent = await BlockFactory.createBlock('/text', this.page, { content: this.value }, this);
                break;
        }
        if (cellContent)
            this.blocks.childs.push(cellContent);
    }
    get isCol(){
        return true;
    }
}
@view('/tablestore/cell')
export class TableStoreCellView extends BaseComponent<TableStoreCell>{
    render() {
        return <div className='sy-tablestore-body-row-cell' style={{ width: this.block.col.width + '%' }}>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}