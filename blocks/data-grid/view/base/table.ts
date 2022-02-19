import React, { MouseEvent } from "react";
import { Confirm } from "../../../../component/lib/confirm";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItemType, MenuItemTypeValue } from "../../../../component/view/menu/declare";
import { useDataGridCreate } from "../../../../extensions/tablestore/create";
import { useTableStoreAddField } from "../../../../extensions/tablestore/field";
import { useFormPage } from "../../../../extensions/tablestore/form";
import { channel } from "../../../../net/channel";
import { Block } from "../../../../src/block";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { prop } from "../../../../src/block/factory/observable";
import { Pattern } from "../../../../src/block/pattern";
import { Matrix } from "../../../../src/common/matrix";
import { Rect } from "../../../../src/common/vector/point";
import { ActionDirective } from "../../../../src/history/declare";
import { util } from "../../../../util/util";
import { SchemaFilter } from "../../schema/declare";
import { Field } from "../../schema/field";
import { TableSchema } from "../../schema/meta";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";
import { DataGridTurns } from "../../turn";
import { TableStoreItem } from "../item";
import { ArrowDownSvg, ArrowUpSvg, FilterSvg, HideSvg, TrashSvg } from "../../../../component/svgs";
export class DataGridView extends Block {
    checkItems: Record<string, any>[] = [];
    @prop()
    fields: ViewField[] = [];
    @prop()
    sorts: { field: string, sort: number }[] = [];
    @prop()
    filter: SchemaFilter = {};
    @prop()
    schemaId: string;
    @prop()
    showRowNum: boolean = false;
    @prop()
    showCheckRow: boolean = false;
    schema: TableSchema;
    init(): void {
        this.registerPropMeta('fields', ViewField, true);
    }
    async load(data) {
        if (!this.pattern) this.pattern = new Pattern(this);
        for (var n in data) {
            if (n == 'pattern') {
                await this.pattern.load(data[n]);
            }
            else if (n == 'matrix') this.matrix = new Matrix(data[n]);
            else if (n == 'fields') {
                data.fields.each(n => {
                    this.fields.push(new ViewField(n));
                })
            }
            else if (n == 'blocks') {
                this.blocks = { childs: [] };
            }
            else {
                this[n] = data[n];
            }
        }
        if (this.syncBlockId) {
            await this.loadSyncBlock();
        }
    }
    async loadSyncBlock(): Promise<void> {
        var r = await channel.get('/page/sync/block', { syncBlockId: this.syncBlockId });
        if (r.ok) {
            var data;
            try {
                data = r.data.content as any;
                if (typeof data == 'string') data = JSON.parse(data);
                delete data.id;
            }
            catch (ex) {
                console.error(ex);
                this.page.onError(ex);
            }
            this.fields = [];
            for (var n in data) {
                if (n == 'pattern') {
                    await this.pattern.load(data[n]);
                }
                else if (n == 'matrix') this.matrix = new Matrix(data[n]);
                else if (n == 'fields') {
                    data.fields.each(n => {
                        this.fields.push(new ViewField(n));
                    })
                }
                else if (n == 'blocks') {
                    this.blocks = { childs: [] };
                }
                else {
                    this[n] = data[n];
                }
            }
        }
    }
    async get() {
        var json: Record<string, any> = {
            id: this._id,
            syncBlockId: this.syncBlockId,
            url: this.url,
            matrix: this.matrix ? this.matrix.getValues() : undefined
        };
        if (typeof this.pattern.get == 'function')
            json.pattern = await this.pattern.get();
        else {
            console.log(this, this.pattern);
        }
        json.blocks = {};
        if (Array.isArray(this.__props)) {
            this.__props.each(pro => {
                if (Array.isArray(this[pro])) {
                    json[pro] = this[pro].map(pr => {
                        if (typeof pr?.get == 'function') return pr.get();
                        else return util.clone(pr);
                    })
                }
                else if (typeof this[pro] != 'undefined') {
                    if (typeof this[pro]?.get == 'function')
                        json[pro] = this[pro].get();
                    else json[pro] = util.clone(this[pro]);
                }
            })
        }
        return json;
    }
    async loadSchema() {
        if (this.schemaId && !this.schema) {
            var r = await channel.get('/schema/query', { id: this.schemaId });
            if (r.ok) {
                this.schema = new TableSchema(r.data.schema);
            }
        }
    }
    async loadViewFields() {
        if (this.fields.length == 0) {
            this.fields = this.schema.getViewFields()
        } else {
            if (!this.fields.some(s => s.fieldId || s.type)) {
                this.fields = this.schema.getViewFields()
            }
            this.fields.each(f => {
                f.schema = this.schema;
            })
        }
    }
    async onGetTurnUrls() {
        return DataGridTurns.urls
    }
    async getWillTurnData(url: string) {
        return await DataGridTurns.turn(this, url);
    }
    get schemaView() {
        return this.schema.views.find(g => g.id == this.syncBlockId);
    }
    data: Record<string, any>[] = [];
    isLoadData: boolean = false;
    index: number = 1;
    size: number = 50;
    total: number = 0;
    async loadData() {
        if (this.schema) {
            var r = await this.schema.list({ page: this.index, size: this.size });
            if (r.data) {
                this.data = Array.isArray(r.data.list) ? r.data.list : [];
                this.total = r.data?.total || 0;
                this.isLoadData = true;
                console.log(this.data, 'data');
            }
        }
    }
    private getSearchFilter() {
        if (this.filter) {
            function buildFilter(filter: SchemaFilter) {
                if (filter.logic) {
                    return { ['$' + filter.logic]: filter.items.map(i => buildFilter(i)) }
                }
                else if (filter.operator) {
                    var field = this.schema.fields.find(g => g.id == filter.field)
                    if (field) return {
                        [field.name]: { ['$' + field.operator]: field.value }
                    }
                }
            }
            return buildFilter(this.filter);
        }
    }
    private getSearchSorts() {
        if (Array.isArray(this.sorts) && this.sorts.length > 0) {
            var sorts = {};
            this.sorts.forEach(so => {
                var field = this.schema.fields.find(g => g.id == so.field)
                if (field) sorts[field.name] = so.sort;
            });
            return sorts;
        }
    }
    async createItem() {
        this.blocks.childs = [];
        for (let i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            var rowBlock: TableStoreItem = await BlockFactory.createBlock('/data-grid/item', this.page, { mark: i, dataIndex: i, dataRow: row }, this) as TableStoreItem;
            this.blocks.childs.push(rowBlock);
            await rowBlock.createElements();
        }
    }
    async createdDidMounted(): Promise<void> {
        if (this.createSource == 'InputBlockSelector') {
            if (!this.schemaId) {
                var dg = await useDataGridCreate({ roundArea: Rect.fromEle(this.el) });
                if (dg) {
                    var r = await channel.put('/schema/create', { text: dg.text, url: this.url });
                    if (r.ok) {
                        var schemaData = r.data.schema;
                        this.schema = new TableSchema(schemaData);
                        await this.onAction(ActionDirective.onCreateTableSchema, async () => {
                            this.page.snapshoot.setSyncBlock(false);
                            this.updateProps({
                                schemaId: this.schema.id,
                                syncBlockId: this.schema.views.first().id
                            })
                        });
                    }
                }
            }
        }
    }
    async didMounted() {
        await this.loadSchema();
        if (this.schema) {
            await this.loadViewFields();
            await this.loadData();
            await this.createItem();
            this.view.forceUpdate();
        }
    }
    async createTableSchema() {
        if (!this.schemaId) {
            var dg = await useDataGridCreate({ roundArea: Rect.fromEle(this.el) });
            if (dg) {
                var r = await channel.put('/schema/create', { text: dg.text, url: this.url });
                if (r.ok) {
                    var schemaData = r.data.schema;
                    this.schema = new TableSchema(schemaData);
                    await this.onAction(ActionDirective.onCreateTableSchema, async () => {
                        this.page.snapshoot.setSyncBlock(false);
                        this.updateProps({
                            schemaId: this.schema.id,
                            syncBlockId: this.schema.views.first().id
                        })
                    });
                    await this.didMounted();
                }
            }
        }
    }
    async onRemoveItem(id: string) {
        if (id) await this.page.onAction(ActionDirective.onSchemaRowDelete, async () => {
            var r = await this.schema.rowRemove(id);
            if (r.ok) {
                var row: Block = this.blocks.childs.find(g => (g as TableStoreItem).dataRow.id == id);
                if (row) await row.delete()
            }
        })
    }
    async onAddOpenForm() {
        var row = await useFormPage({
            schema: this.schema,
            recordViewId: this.schema.recordViews[0].id
        });
        await this.onAddRow(row, undefined, 'after');
    }
    async onEditOpenForm(id: string) {
        var rowData = this.data.find(g => g.id == id);
        var row = await useFormPage({
            schema: this.schema,
            recordViewId: this.schema.recordViews[0].id,
            row: rowData
        });
        await this.onRowUpdate(id, row);
    }
    async onAddRow(data, id?: string, arrow: 'before' | 'after' = 'after') {
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
    async onRowUpdate(id: string, data: Record<string, any>) {
        var oldItem = this.data.find(g => g.id == id);
        if (!util.valueIsEqual(oldItem, data)) {
            var r = await this.schema.rowUpdate({ dataId: id, data });
            if (r.ok) {
                Object.assign(oldItem, data);
                var row: Block = this.blocks.childs.find(g => (g as TableStoreItem).dataRow.id == id);
                if (row) row.forceUpdate();
            }
        }
    }
    async onAddField(event: React.MouseEvent | MouseEvent, at?: number) {
        event.stopPropagation();
        var self = this;
        var result = await useTableStoreAddField(
            { roundArea: Rect.fromEle(event.target as HTMLDivElement) },
            {
                text: '',
                type: FieldType.text,
                check(newText) {
                    if (!newText) return '表格列名不能为空'
                    return self.fields.some(s => s.text == newText) ? '表列名有重复' : ""
                }
            }
        );
        if (!result) return;
        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            var fieldData = await this.schema.fieldAdd({ text: result.text, type: result.type });
            if (fieldData.ok) {
                var field = new Field();
                field.load(fieldData.data);
                this.schema.fields.push(field);
                if (typeof at == 'undefined') at = this.fields.length;
                var vf = this.schema.createViewField(field);
                var newFields = this.fields.map(f => f.clone());
                newFields.push(vf);
                this.changeFields(this.fields, newFields);
                this.data.forEach(row => {
                    var defaultValue = field.getDefaultValue();
                    if (typeof defaultValue != 'undefined')
                        row[field.name] = defaultValue
                });
                await this.createItem();
            }
        });
    }
    async onUpdateField(viewField: ViewField, data: Record<string, any>) {
        this.page.onAction(ActionDirective.onSchemaUpdateField, async () => {
            await this.schema.fieldUpdate({ fieldId: viewField.field.id, data });
            viewField.field.load(data);
            await this.createItem();
        });
    }
    async onDeleteField(viewField: ViewField) {
        if (await Confirm('确定要删除该列吗')) {
            var field = viewField.field;
            this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
                var r = await this.schema.fieldRemove(field.id);
                if (r.ok) {
                    var name = field.name;
                    var fields = this.fields.map(c => c.clone());
                    fields.remove(g => g.fieldId == field.id);
                    this.changeFields(this.fields, fields);
                    this.data.forEach(row => {
                        delete row[name];
                    });
                    await this.createItem();
                }
            });
        }
    }
    async onHideField(viewField: ViewField) {
        this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
            var fields = this.fields.map(f => f.clone());
            fields.remove(g => g == viewField);
            this.changeFields(this.fields, fields);
            await this.createItem();
        });
    }
    async onSetSortField(viewField: ViewField, sort?: 0 | 1 | -1) {
        if (this.sorts.some(s => s.field == viewField.field.id && s.sort == sort)) {
            return;
        }
        await this.page.onAction(ActionDirective.onTablestoreUpdateViewField, async () => {
            var so = this.sorts.find(g => g.field == viewField.field.id);
            if (so) so.sort = sort;
            else this.sorts.push({ field: viewField.field.id, sort });
            await this.loadData();
            await this.createItem();
        });
    }
    async onTurnField(at: number, type: FieldType) {
        if (typeof at == 'undefined') at = this.fields.length - 1;
        var viewField = this.fields[at];
        var field = viewField.field;
        await this.page.onAction(ActionDirective.onSchemaTurnField, async () => {
            var r = await this.schema.turnField({ fieldId: field.id, type: type });
            if (r.ok) {
                field.type = type;
                await this.loadData();
                await this.createItem();
            }
        });
        await this.loadData()
    }
    async openConfigField(event: React.MouseEvent | MouseEvent, viewField: ViewField) {
        event.stopPropagation();
        var items: MenuItemType<BlockDirective | string>[] = [];
        if (viewField.type) {
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemTypeValue.input,
                    value: viewField.field?.text,
                    text: '编辑列名',
                },
                { type: MenuItemTypeValue.divide },
                {
                    name: 'hide',
                    icon: HideSvg,
                    text: '隐藏列'
                }
            ]);
        }
        else {
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemTypeValue.input,
                    value: viewField.field?.text,
                    text: '编辑列名',
                },
                { type: MenuItemTypeValue.divide },
                { name: 'filter', icon: FilterSvg, text: '过滤' },
                { name: 'sortDesc', icon: ArrowDownSvg, text: '降序' },
                { name: 'sortAsc', icon: ArrowUpSvg, text: '升序' },
                { type: MenuItemTypeValue.divide },
                {
                    name: 'delete',
                    icon: TrashSvg,
                    text: '删除列',
                    disabled: viewField.field?.type == FieldType.title ? true : false
                },
                {
                    name: 'hide',
                    icon: HideSvg,
                    text: '隐藏列'
                }
            ]);
        }
        var re = await useSelectMenuItem(
            {
                roundArea: Rect.fromEvent(event),
                direction: 'left'
            },
            items
        );
        if (re) {
            var ReItem = items.find(g => g.name == 'name');
            if (re.item.name == 'hide') {
                this.onHideField(viewField);
            }
            else if (re.item.name == 'delete') {
                this.onDeleteField(viewField);
            }
            else if (re.item.name == 'filter') {
                this.onAddFilter(viewField);
            }
            else if (re.item.name == 'sortDesc') {
                this.onSetSortField(viewField, -1);
            }
            else if (re.item.name == 'sortAsc') {
                this.onSetSortField(viewField, 1);
            }
            if (ReItem.value != viewField.field?.text) {
                //编辑列名了
                this.onUpdateField(viewField, { text: ReItem.value })
            }
        }
    }
    async onDataGridTurnView(viewId: string) {
        if (this.syncBlockId != viewId) {
            this.onAction(ActionDirective.onDataGridTurnView, async () => {
                this.page.snapshoot.setSyncBlock(false);
                var view = this.schema.views.find(g => g.id == viewId);
                await this.page.createBlock(view.url,
                    {
                        syncBlockId: viewId,
                        schemaId: this.schema.id
                    },
                    this.parent,
                    this.at
                );
                await this.delete();
            })
        }
    }
    async onUpdateSorts(sorts: { field: string, sort: number }[]) {
        this.onAction(ActionDirective.onDataGridUpdateSorts, async () => {
            this.updateProps({ sorts })
        })
    }
    async onUpdateFilter(filter: SchemaFilter) {
        this.onAction(ActionDirective.onDataGridUpdateFilter, async () => {
            this.updateProps({ filter })
        })
    }
    async onAddFilter(viewField: ViewField) {
        this.onAction(ActionDirective.onDataGridUpdateFilter, async () => {
            if (!Array.isArray(this.filter.items)) {
                this.filter = { logic: 'and', items: [] }
            }
            this.filter.items.push({
                operator: '$contain',
                field: viewField.field.id
            })
            this.updateProps({ filter: this.filter })
        })
    }
    async onShowNum(visible: boolean) {
        var newFields = this.fields.map(f => f.clone());
        if (visible == true && newFields.some(s => s.type == 'rowNum')) {
            return
        }
        else if (visible == false && !newFields.some(s => s.type == 'rowNum')) {
            return
        }
        this.onAction(ActionDirective.onDataGridShowRowNum, async () => {
            if (visible == true) {
                newFields.insertAt(0, new ViewField({ type: 'rowNum', text: '序号' }, this.schema))
            }
            else newFields.remove(g => g.type == 'rowNum');
            this.updateProps({ showRowNum: visible });
            this.changeFields(this.fields, newFields);
            await this.createItem();
            this.forceUpdate();
        })
    }
    async onShowAutoIncrement(visible: boolean) {
        var newFields = this.fields.map(f => f.clone());
        if (visible == true && newFields.some(s => s.field?.type == FieldType.autoIncrement)) {
            return
        }
        else if (visible == false && !newFields.some(s => s.field?.type == FieldType.autoIncrement)) {
            return
        }
        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            var sf = this.schema.fields.find(g => g.type == FieldType.autoIncrement);
            if (visible == true) {
                newFields.insertAt(0, new ViewField({ text: '编号', fieldId: sf.id }, this.schema))
            }
            else newFields.remove(g => g.field?.type == FieldType.autoIncrement);
            this.changeFields(this.fields, newFields);
            await this.createItem();
            this.forceUpdate();
        });
    }
    async onShowCheck(visible: boolean) {
        var newFields = this.fields.map(f => f.clone());
        if (visible == true && newFields.some(s => s.type == 'check')) return
        else if (visible == false && !newFields.some(s => s.type == 'check')) return
        this.onAction(ActionDirective.onDataGridShowCheck, async () => {
            if (visible == true) {
                newFields.insertAt(0, new ViewField({ type: 'check', text: '选择' }, this.schema))
            }
            else newFields.remove(g => g.type == 'check');
            this.updateProps({ showCheckRow: visible });
            this.changeFields(this.fields, newFields);
            await this.createItem();
            this.forceUpdate();
        })
    }
    changeFields(oldFields: ViewField[], newFields: ViewField[]) {
        this.manualUpdateProps({
            fields: oldFields.map(o => o.get())
        }, {
            fields: newFields.map(f => f.get())
        }, BlockRenderRange.none, true);
        this.fields = newFields;
    }
    async onCheckRow(row: Record<string, any>, checked: boolean) {
        if (checked) {
            if (!this.checkItems.some(s => s.id == row.id)) {
                this.checkItems.push(row);
            }
        }
        else {
            this.checkItems.remove(r => r.id == row.id);
        }
    }
}