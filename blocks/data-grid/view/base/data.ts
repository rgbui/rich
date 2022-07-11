import { useFormPage } from "../../../../extensions/data-grid/form";
import { Block } from "../../../../src/block";
import { ActionDirective } from "../../../../src/history/declare";
import { util } from "../../../../util/util";
import { TableStoreItem } from "../item";
import { DataGridView } from ".";

export class DataGridViewData {
    async onRemoveItem(this: DataGridView, id: string) {
        if (id) await this.page.onAction(ActionDirective.onSchemaRowDelete, async () => {
            var r = await this.schema.rowRemove(id);
            if (r.ok) {
                var row: Block = this.blocks.childs.find(g => (g as TableStoreItem).dataRow.id == id);
                if (row) await row.delete()
            }
        })
    }
    async onOpenAddForm(this: DataGridView, initData?: Record<string, any>) {
        var row = await useFormPage({
            schema: this.schema,
            recordViewId: this.schema.recordViews[0].id
        });
        if (row) await this.onAddRow(row, undefined, 'after');
    }
    async onOpenEditForm(this: DataGridView, id: string) {
        var rowData = this.data.find(g => g.id == id);
        var row = await useFormPage({
            schema: this.schema,
            recordViewId: this.schema.recordViews[0].id,
            row: rowData
        });
        if (row) await this.onRowUpdate(id, row);
    }
    async onAddRow(this: DataGridView, data, id?: string, arrow: 'before' | 'after' = 'after') {
        if (typeof id == 'undefined') {
            id = this.data.last().id;
        }
        await this.page.onAction(ActionDirective.onSchemaCreateDefaultRow, async () => {
            var r = await this.schema.rowAdd({ data, pos: { dataId: id, pos: arrow } });
            if (r.ok) {
                var newRow = r.data.data;
                var at = this.data.findIndex(g => g.id == id);
                if (arrow == 'after') at += 1;
                this.data.insertAt(at, newRow);
                await this.createItem();
                this.forceUpdate();
            }
        });
    }
    async onRowUpdate(this: DataGridView, id: string, data: Record<string, any>) {
        var oldItem = this.data.find(g => g.id == id);
        if (!util.valueIsEqual(oldItem, data)) {
            var r = await this.schema.rowUpdate({ dataId: id, data: util.clone(data) });
            if (r.ok) {
                Object.assign(oldItem, data);
                var row: TableStoreItem = this.blocks.childs.find(g => (g as TableStoreItem).dataRow.id == id) as TableStoreItem;
                if (row) {
                    row.dataRow = oldItem;
                    await row.createElements();
                    row.forceUpdate();
                }
            }
        }
    }
}