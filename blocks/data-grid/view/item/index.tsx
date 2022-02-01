import React from "react";
import { MenuItemType } from "../../../../component/view/menu/declare";
import { Block } from "../../../../src/block";
import { BlockDirective } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { util } from "../../../../util/util";
import { ViewField } from "../../schema/view";
import { DataGridView } from "../base/table";
import { createFieldBlock } from "./service";
import trash from "../../../../src/assert/svg/trash.svg";
import "./style.less";
import { langProvider } from "../../../../i18n/provider";
import { LangID } from "../../../../i18n/declare";
@url('/data-grid/item')
export class TableStoreItem extends Block {
    dataRow: Record<string, any> = {};
    get schema() {
        return (this.parent as DataGridView).schema;
    }
    get fields() {
        return (this.parent as DataGridView).fields;
    }
    get dataGrid() {
        if (this.parent instanceof DataGridView) {
            return this.parent;
        }
    }
    async createElements() {
        for (let i = 0; i < this.fields.length; i++) {
            var field = this.fields[i];
            var block = await createFieldBlock(field, this.dataRow, this);
            this.blocks.childs.push(block);
        }
    }
    async onUpdateCellValue(viewField: ViewField, value: any) {
        value = util.clone(value);
        this.dataRow[viewField.field.name] = value;
        await this.schema.rowUpdate({
            dataId: this.dataRow.id,
            data: { [viewField.field.name]: value }
        })
    }
    async onUpdateFieldSchema(viewField: ViewField, data) {
        data = util.clone(data);
        viewField.field.update(data);
        await this.schema.fieldUpdate({ fieldId: viewField.field.id, data })
    }
    async onGetContextMenus(): Promise<MenuItemType<string | BlockDirective>[]> {
        var items: MenuItemType<BlockDirective>[] = [];
        items.push({
            name: BlockDirective.delete,
            icon: trash,
            text: langProvider.getText(LangID.menuDelete),
            label: "delete"
        });
        return items;
    }
    async onClickContextMenu(item: MenuItemType<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {
            case BlockDirective.delete:
                this.dataGrid.onRemoveItem(this.dataRow.id);
                break;
        }
    }
}
@view('/data-grid/item')
export class TableStoreItemView extends BlockView<TableStoreItem>{
    render() {
        return <div className='sy-data-grid-item'>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}


