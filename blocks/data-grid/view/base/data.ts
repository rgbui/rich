
import { Block } from "../../../../src/block";
import { ActionDirective } from "../../../../src/history/declare";
import { util } from "../../../../util/util";
import { TableStoreItem } from "../item";
import { DataGridView } from ".";
import { channel } from "../../../../net/channel";
import { getElementUrl, ElementType } from "../../../../net/element.type";
import { Page } from "../../../../src/page";

export class DataGridViewData {
    async onRemoveRow(this: DataGridView, id: string) {
        if (id) await this.page.onAction(ActionDirective.onSchemaRowDelete, async () => {
            var r = await this.schema.rowRemove(id);
            if (r.ok) {
                var row: Block = this.blocks.childs.find(g => (g as TableStoreItem).dataRow.id == id);
                if (row) await row.delete()
            }
        })
    }
    async onOpenAddForm(this: DataGridView, viewId?: string, initData?: Record<string, any>) {
        var dialougPage: Page = await channel.air('/page/dialog', {
            elementUrl: getElementUrl(ElementType.SchemaRecordView, this.schema.id, viewId || this.schema.defaultAddForm?.id)
        })
        if (dialougPage) {
            var newRow = dialougPage.getSchemaRow();
            if (newRow) {
                await this.onAddRow(newRow, undefined, 'after')
            }
        }
        await channel.air('/page/dialog', { elementUrl: null });
    }
    async onOpenEditForm(this: DataGridView, id: string) {
        var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog';
        if (this.openRecordSource == 'page')
            url = '/page/open';
        else if (this.openRecordSource == 'slide')
            url = '/page/slide';
        var dialougPage: Page = await channel.air(url, {
            elementUrl: getElementUrl(ElementType.SchemaRecordViewData, this.schema.id, this.schema.defaultEditForm.id, id)
        })
        var newRow;
        if (dialougPage) newRow = dialougPage.getSchemaRow()
        if (this.openRecordSource != 'page')
            await channel.air(url, { elementUrl: null })
        if (newRow)
            await this.onRowUpdate(id, newRow);
    }
    async onAddRow(this: DataGridView, data, id?: string, arrow: 'before' | 'after' = 'after') {
        if (typeof id == 'undefined') {
            id = this.data.last()?.id
        }
        await this.page.onAction(ActionDirective.onSchemaCreateDefaultRow, async () => {
            var r = await this.schema.rowAdd({ data, pos: { id: id, pos: arrow } });
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
        var rj = {};
        for (let n in data) {
            rj[n] = oldItem[n];
        }
        if (!util.valueIsEqual(rj, data)) {
            var r = await this.schema.rowUpdate({ dataId: id, data: util.clone(data) });
            if (r.ok) {
                Object.assign(oldItem, data);
                await this.createItem();
                this.forceUpdate();
            }
        }
    }
}