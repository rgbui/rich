
import { Block } from "../../../../src/block";
import { ActionDirective } from "../../../../src/history/declare";
import { util } from "../../../../util/util";
import { TableStoreItem } from "../item";
import { DataGridView } from ".";
import { channel } from "../../../../net/channel";
import { getElementUrl, ElementType } from "../../../../net/element.type";
import { Page } from "../../../../src/page";
import lodash from "lodash";
import { Point } from "../../../../src/common/vector/point";

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
        if (vid && !this.schema.recordViews.some(s => s.id == vid)) vid = undefined;
        if (!vid) vid = this.schema.recordViews[0]?.id;
        if (isOver)
            this.dataGridTool.isOpenTool = true;
        var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog';
        if (this.createRecordSource == 'page') {
            url = '/page/open';
        }
        else if (this.createRecordSource == 'slide') {
            url = '/page/slide';
        }
        if (forceUrl) url = forceUrl;
        var dialougPage: Page = await channel.air(url, {
            elementUrl: getElementUrl(ElementType.SchemaRecordView, this.schema.id, vid),
            config: {
                force: true,
                isCanEdit:true,
                initData
            }
        })
        if (dialougPage) {
            dialougPage.onSave();
            var newRow = await dialougPage.getSchemaRow();
            if (newRow) await this.onAddRow(newRow, undefined, 'after', dialougPage)
        }
        if (url != '/page/open') await channel.air(url, { elementUrl: null });
        if (isOver) {
            this.dataGridTool.isOpenTool = false;
            this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
        }
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
        var dialougPage: Page = await channel.air(url, {
            elementUrl: getElementUrl(ElementType.SchemaData, this.schema.id, id),
            config: {
                force: true,
                isCanEdit:true
            }
        })
        var newRow;
        if (dialougPage) {
            dialougPage.onSave();
            newRow = await dialougPage.getSchemaRow()
        }
        if (url == '/page/dialog' || url == '/page/slide') await channel.air(url, { elementUrl: null })
        if (newRow && this.isCanEdit()) await this.onRowUpdate(id, newRow);
    }
    async onAddRow(this: DataGridView, data, id?: string, arrow: 'before' | 'after' = 'after', dialogPage: Page = null) {
        if (typeof id == 'undefined') {
            id = this.data.last()?.id
        }
        var newRow;
        var r = await this.schema.rowAdd({ data, pos: { id: id, pos: arrow } });
        if (r.ok) {
            newRow = r.data.data;
            if (dialogPage) {
                await channel.act('/view/snap/store',
                    {
                        elementUrl: getElementUrl(ElementType.SchemaData,
                            this.schema.id,
                            newRow.id
                        ),
                        seq: 0,
                        plain: await dialogPage.getPlain(),
                        thumb: await dialogPage.getThumb(),
                        content: await dialogPage.getString(),
                        text: newRow.title,
                    })
            }
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
}