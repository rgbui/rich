import { BlockView } from "../../../../../src/block/view";
import React from 'react';
import { url, view } from "../../../../../src/block/factory/observable";
import { ChildsArea } from "../../../../../src/block/view/appear";
import { BlockDisplay } from "../../../../../src/block/enum";
import { Block } from "../../../../../src/block";
import { TableStoreRow } from "./row";
import { TableStore } from "..";
import { FieldType } from "../../../schema/type";
import { BlockFactory } from "../../../../../src/block/factory/block.factory";
import { OriginField } from "../../../element/field/origin.field";
@url('/tablestore/cell')
export class TableStoreCell extends Block {
    display = BlockDisplay.block;
    name: string;
    partName = 'cell';
    get tableRow(): TableStoreRow {
        return this.parent as TableStoreRow;
    }
    get tableStore(): TableStore {
        return this.tableRow.tableStore;
    }
    get viewField() {
        return this.tableStore.fields[this.at];
    }
    get field() {
        return this.viewField.field;
    }
    async createCellContent() {
        this.blocks.childs = [];
        var cellContent: Block;
        var row = this.tableRow.dataRow;
        switch (this.field.type) {
            case FieldType.text:
                cellContent = await BlockFactory.createBlock('/field/text', this.page, {
                    value: this.viewField.getValue(row),
                    fieldType: this.field.type
                }, this);
                break;
            case FieldType.autoIncrement:
            case FieldType.number:
                cellContent = await BlockFactory.createBlock('/field/number', this.page, {
                    value: this.viewField.getValue(row),
                    fieldType: this.field.type
                }, this);
                break;
            case FieldType.modifyDate:
            case FieldType.createDate:
            case FieldType.date:
                cellContent = await BlockFactory.createBlock('/field/date', this.page, {
                    fieldType: this.field.type,
                    value: this.viewField.getValue(row),
                }, this);
                break;
            case FieldType.option:
                cellContent = await BlockFactory.createBlock('/field/option', this.page, {
                    fieldType: this.field.type,
                    value: this.viewField.getValue(row),
                }, this);
                break;
            case FieldType.creater:
            case FieldType.modifyer:
                cellContent = await BlockFactory.createBlock('/field/user', this.page, {
                    fieldType: this.field.type,
                    value: this.viewField.getValue(row),
                }, this);
                break;
            case FieldType.bool:
                cellContent = await BlockFactory.createBlock('/field/check', this.page, {
                    fieldType: this.field.type,
                    value: this.viewField.getValue(row),
                },this);
                break;

        }
        if (cellContent)
            this.blocks.childs.push(cellContent);
    }
    async onUpdateCellValue(value: any) {
        var id = this.tableRow.dataRow.id;
        await this.tableStore.onRowUpdateCell(id, this.viewField, value)
    }
    async onUpdateCellField(props: Record<string, any>) {

    }
    async onUpdateCellFieldSchema(props: Record<string, any>) {
        await this.tableStore.onUpdateCellFieldSchema(this.field, props)
    }
    get isCol() {
        return true;
    }
    get handleBlock(): Block {
        return this.parent;
    }
}
@view('/tablestore/cell')
export class TableStoreCellView extends BlockView<TableStoreCell>{
    mousedown(event: React.MouseEvent) {
        if (this.block.childs.length == 1) {
            var cellBlock = this.block.childs.first();
            if (cellBlock instanceof OriginField) {
                cellBlock.onCellMousedown(event);
            }
        }
    }
    render() {
        return <div className='sy-tablestore-body-row-cell' onMouseDown={e => this.mousedown(e)} ref={e => this.block.childsEl = e}
            style={{ width: this.block.viewField.colWidth }}>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}