
import { TrashSvg } from "../../../component/svgs";
import { MenuItem } from "../../../component/view/menu/declare";
import { LangID } from "../../../i18n/declare";
import { langProvider } from "../../../i18n/provider";
import { Block } from "../../../src/block";
import { BlockDirective } from "../../../src/block/enum";
import { util } from "../../../util/util";
import { ViewField } from "../schema/view";
import { DataGridView } from "../view/base";
import { createFieldBlock } from "../view/item/service";
export class DataGridCard extends Block {
    rowId:string='';
    dataIndex: number;
    get schema() {
        return (this.parent as DataGridView).schema;
    }
    get fields() {
        return (this.parent as DataGridView).fields;
    }
    get dataRow(){
        return this.dataGrid.data.find(g=>g.id==this.rowId);
    }
    get dataGrid() {
        if (this.parent instanceof DataGridView) {
            return this.parent;
        }
    }
    async createElements() {
        this.blocks.childs = [];
        for (let i = 0; i < this.fields.length; i++) {
            var field = this.fields[i];
            if (field) {
                var block = await createFieldBlock(field, { row: this.dataRow, index: this.dataIndex }, this);
                if (block) this.blocks.childs.push(block);
            }
            else {
                console.log(this, this.fields);
            }
        }
    }
    async onUpdateCellValue(viewField: ViewField, value: any) {
        value = util.clone(value);
        this.dataRow[viewField.field.name] = value;
        var dr = this.dataGrid.data.find(g => g.id == this.dataRow.id);
        dr[viewField.field.name] = value;
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
    async onGetContextMenus(): Promise<MenuItem<string | BlockDirective>[]> {
        var items: MenuItem<BlockDirective>[] = [];
        items.push({
            name: BlockDirective.delete,
            icon: TrashSvg,
            text: langProvider.getText(LangID.menuDelete),
            label: "delete"
        });
        return items;
    }
    async onClickContextMenu(item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {
            case BlockDirective.delete:
                this.dataGrid.onRemoveItem(this.dataRow.id);
                break;
        }
    }
}