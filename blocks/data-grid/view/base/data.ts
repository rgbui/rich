
import { Block } from "../../../../src/block";
import { ActionDirective } from "../../../../src/history/declare";
import { util } from "../../../../util/util";
import { TableStoreItem } from "../item";
import { DataGridView } from ".";
import { channel } from "../../../../net/channel";
import { getElementUrl, ElementType } from "../../../../net/element.type";
import lodash from "lodash";
import { FieldType } from "../../schema/type";

export class DataGridViewData {
    async onRemoveRow(this: DataGridView, id: string) {
        if (id) await this.page.onAction(ActionDirective.onSchemaRowDelete, async () => {
            var r = await this.schema.rowRemove(id);
            if (r.ok) {
                var row: Block = this.blocks.childs.find(g => (g as TableStoreItem).dataRow.id == id);
                if (row) await row.delete()
                lodash.remove(this.data, g => g.id == id);
                this.total -= 1;
                this.onNotifyPageReferenceBlocks();
            }
        })
    }
    async onOpenAddForm(this: DataGridView, viewId?: string, isOver?: boolean, forceUrl?: '/page/open' | '/page/dialog' | '/page/slide', initData?: Record<string, any>) {
        var vid = viewId || this.schema.defaultAddForm?.id;
        var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog';
        if (this.createRecordSource == 'page') {
            url = '/page/open';
        }
        else if (this.createRecordSource == 'slide') {
            url = '/page/slide';
        }
        if (forceUrl) url = forceUrl;
        await this.onDataGridTool(async () => {
            await channel.air(url, {
                elementUrl: getElementUrl(ElementType.SchemaRecordView, this.schema.id, vid),
                config: {
                    force: true,
                    isCanEdit: true,
                    initData
                }
            })
            await this.loadDataGrid();
        })
    }
    async onOpenEditForm(this: DataGridView, id: string, forceUrl?: '/page/open' | '/page/dialog' | '/page/slide') {
        var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog';
        if (typeof forceUrl == 'string') url = forceUrl;
        else {
            if (this.openRecordSource == 'page')
                url = '/page/open';
            else if (this.openRecordSource == 'slide')
                url = '/page/slide';
        }
        var elementUrl = getElementUrl(ElementType.SchemaData, this.schema.id, id)
        if (this.openRecordViewId) {
            var view = this.schema.views.find(g => g.id == this.openRecordViewId);
            if (view) {
                elementUrl = getElementUrl(ElementType.SchemaRecordViewData, this.schema.id, view.id, id)
            }
        }
        await this.onDataGridTool(async () => {
            await channel.air(url, {
                elementUrl: elementUrl,
                config: {
                    force: true,
                    isCanEdit: true
                }
            })
            await this.loadDataGrid();
        })
    }
    async onAddRow(this: DataGridView, data, id?: string, arrow: 'before' | 'after' = 'after') {
        if (typeof id == 'undefined') {
            id = this.data.last()?.id
        }
        var newRow;
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
        return lodash.cloneDeep(newRow);
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
    async onCloneRow(this: DataGridView, data) {
        var dr = lodash.cloneDeep(data);
        dr.id = util.guid();
        this.schema.fields.forEach(f => {
            if ([
                FieldType.autoIncrement,
                FieldType.sort,
                FieldType.createDate,
                FieldType.creater,
                FieldType.modifyDate,
                FieldType.modifyer
            ].includes(f.type)) {
                dr[f.name] = undefined;
            }
        })
        var r = await this.schema.rowAdd({ data: dr, pos: { id: data.id, pos: 'after' } });
        if (r) {
            var at = this.data.findIndex(g => g.id == data.id);
            this.data.insertAt(at, dr);
            this.total += 1;
            await this.onNotifyPageReferenceBlocks();
            await this.createItem();
            this.forceUpdate();
        }
    }
}