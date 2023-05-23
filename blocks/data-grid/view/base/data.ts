
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
                this.total -= 1;
                this.onNotifyPageReferenceBlocks();
            }
        })
    }
    async onOpenAddForm(this: DataGridView, viewId?: string, initData?: Record<string, any>) {
        if (!this.schema.defaultAddForm) {
            //自动创建表单
        }
        var vid = viewId || this.schema.defaultAddForm?.id;
        if (!vid) vid = this.schema.recordViews[0]?.id;
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
        var vid = this.schema.defaultEditFormId;
        if (!vid) vid = this.schema.recordViews[0]?.id;
        var dialougPage: Page = await channel.air(url, {
            elementUrl: getElementUrl(ElementType.SchemaRecordViewData,
                this.schema.id,
                vid,
                id
            )
        })
        var newRow;
        if (dialougPage) newRow = dialougPage.getSchemaRow()
        if (this.openRecordSource != 'page') await channel.air(url, { elementUrl: null })
        if (newRow) await this.onRowUpdate(id, newRow);
    }
    async onAddRow(this: DataGridView, data, id?: string, arrow: 'before' | 'after' = 'after') {
        if (typeof id == 'undefined') {
            id = this.data.last()?.id
        }
        var newRow;
        await this.page.onAction(ActionDirective.onSchemaCreateDefaultRow, async () => {
            var r = await this.schema.rowAdd({ data, pos: { id: id, pos: arrow } });
            if (r.ok) {
                newRow = r.data.data;
                var at = this.data.findIndex(g => g.id == id);
                if (arrow == 'after') at += 1;
                this.data.insertAt(at, newRow);
                this.total += 1;
                this.onNotifyPageReferenceBlocks();
                await this.createItem();
                this.forceUpdate();
            }
        });
        return newRow;
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