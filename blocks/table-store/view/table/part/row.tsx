import { Block } from "../../../../../src/block";
import { BlockView } from "../../../../../src/block/view";
import { BlockDirective, BlockDisplay } from "../../../../../src/block/enum";
import { url, view } from "../../../../../src/block/factory/observable";
import React from 'react';
import { ChildsArea } from "../../../../../src/block/view/appear";
import { TableStore } from "..";
import { TableStoreCell } from "./cell";
import { BlockFactory } from "../../../../../src/block/factory/block.factory";
import { MenuItemType, MenuItemTypeValue } from "../../../../../component/view/menu/declare";



import trash from "../../../../../src/assert/svg/trash.svg";
import duplicate from "../../../../../src/assert/svg/duplicate.svg";
import filter from "../../../../../src/assert/svg/filter.svg";
import arrowDown from "../../../../../src/assert/svg/arrowDown.svg";
import arrowUp from "../../../../../src/assert/svg/arrowUp.svg";
import { OriginField } from "../../../element/field/origin.field";

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
    async onClickContextMenu(item: MenuItemType<BlockDirective>, event: MouseEvent) {
        var id = this.dataRow.id;
        switch (item.name) {
            case BlockDirective.fieldSettings:
                break;
            case BlockDirective.arrowDown:
                await this.tableStore.onAddRow({}, id, 'down');
                break;
            case BlockDirective.arrowUp:
                await this.tableStore.onAddRow({}, id, 'up');
                break;
            case BlockDirective.filter:
                await this.tableStore.onEditOpenForm(id);
                break;
            case BlockDirective.delete:
                await this.tableStore.onRowDelete(id);
                break;
        }
    }
    async onGetContextMenus(this: Block): Promise<MenuItemType<BlockDirective>[]> {
        var items: MenuItemType<BlockDirective>[] = [];
        items.push({
            name: BlockDirective.arrowDown,
            text: '上边插入新行',
            icon: arrowDown
        });
        items.push({
            name: BlockDirective.arrowUp,
            text: '下边插入新行',
            icon: arrowUp
        });
        items.push({ type: MenuItemTypeValue.divide });
        items.push({
            name: BlockDirective.filter,
            text: '打开编辑',
            icon: filter
        });
        items.push({ type: MenuItemTypeValue.divide });
        items.push({
            name: BlockDirective.delete,
            icon: trash,
            text: '删除'
        });
        return items;
    }
    async updateData(data) {
        this.blocks.childs.each(cell => {
            var fieldCell: OriginField = cell.childs.first() as OriginField;
            if (typeof data[fieldCell.schemaField.name] != 'undefined')
                fieldCell.value = data[fieldCell.schemaField.name];
        });
        this.view.forceUpdate();
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