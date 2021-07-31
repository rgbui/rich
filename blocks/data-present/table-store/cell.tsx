import { BlockView } from "../../../src/block/view";
import React from 'react';
import { url, view } from "../../../src/block/factory/observable";
import { ChildsArea } from "../../../src/block/partial/appear";
import { BlockAppear, BlockDisplay } from "../../../src/block/enum";
import { Block } from "../../../src/block";
import { TableStoreRow } from "./row";
import { TableStore } from "./table";
import { FieldType } from "../schema/field.type";
import { BlockFactory } from "../../../src/block/factory/block.factory";


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
        return this.tableStore.fields[this.at];
    }
    async createCellContent() {
        this.blocks.childs = [];
        var cellContent: Block;
        var row = this.tableRow.dataRow;
        switch (this.field.type) {
            case FieldType.text:
                cellContent = await BlockFactory.createBlock('/field/text', this.page, {
                    content: this.field.getValue(row),
                    fieldType: this.field.type
                }, this);
                break;
            case FieldType.autoIncrement:
            case FieldType.number:
                cellContent = await BlockFactory.createBlock('/field/number', this.page, {
                    content: this.field.getValue(row),
                    fieldType: this.field.type
                }, this);
                break;
            case FieldType.modifyDate:
            case FieldType.createDate:
            case FieldType.date:
                cellContent = await BlockFactory.createBlock('/field/date', this.page, {
                    fieldType: this.field.type,
                    content: this.field.getValue(row)
                }, this);
                break;
            case FieldType.option:
                cellContent = await BlockFactory.createBlock('/field/option', this.page, {
                    fieldType: this.field.type,
                    content: this.field.getValue(row)
                }, this);
                break;
            case FieldType.creater:
            case FieldType.modifyer:
                cellContent = await BlockFactory.createBlock('/field/user', this.page, {
                    fieldType: this.field.type,
                    content: this.field.getValue(row)
                }, this);
                break;
        }
        if (cellContent)
            this.blocks.childs.push(cellContent);
    }
    async onUpdateCellValue(value: any) {

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