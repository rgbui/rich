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
import { ArrowDownSvg, ArrowUpSvg, FilterSvg, HideSvg, SettingsSvg, TrashSvg } from "../../../../component/svgs";
import { getFieldMenus, getTypeSvg } from "../../schema/util";
import { useRelationView } from "../../../../extensions/tablestore/relation";
import { useRollupView } from "../../../../extensions/tablestore/rollup";
import { useFormula } from "../../../../extensions/tablestore/formula";
import { useFieldEmojiView } from "../../../../extensions/tablestore/emoji";
import { PageLayoutType } from "../../../../src/page/declare";
import { PageDirective } from "../../../../src/page/directive";
import { DataGridTool } from "../components/tool";
import dayjs from "dayjs";

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
    relationSchemas: TableSchema[] = [];
    relationDatas: Map<string, any[]> = new Map();
    isOver: boolean = false;
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
            if (!this.fields.every(s => s.fieldId || s.type ? true : false)) {
                this.fields = this.schema.getViewFields()
            }
            this.fields.each(f => {
                f.schema = this.schema;
            })
        }
        if (this.page.pageLayout.type == PageLayoutType.dbPickRecord) {
            if (!this.fields.some(s => s.type == 'check')) {
                this.fields.insertAt(0, new ViewField({ type: 'check', text: '选择' }, this.schema))
            }
        }
    }
    async loadRelationSchemas() {
        var tableIds: string[] = [];
        this.fields.each(f => {
            if (f.field?.type == FieldType.relation) {
                if (f.field.config.relationTableId) {
                    tableIds.push(f.field.config.relationTableId);
                }
            }
        });
        if (tableIds.length > 0) {
            var rs = await channel.get('/schema/ids/list', { ids: tableIds });
            if (rs.ok) {
                this.relationSchemas = rs.data.list.map(g => new TableSchema(g))
            }
        }
    }
    async loadRelationDatas() {
        if (this.relationSchemas.length > 0) {
            var maps: { key: string, ids: string[] }[] = [];
            this.data.forEach(row => {
                this.fields.each(f => {
                    if (f?.field?.type == FieldType.relation) {
                        var vs = row[f?.field.name];
                        if (!Array.isArray(vs)) vs = [];
                        var ms = maps.find(g => g.key == f?.field.config.relationTableId);
                        if (Array.isArray(ms?.ids)) {
                            vs.each(v => {
                                if (!ms?.ids.includes(v)) ms?.ids.push(v)
                            })
                        }
                        else {
                            maps.push({ key: f?.field.config.relationTableId, ids: vs })
                        }
                    }
                })
            });
            await maps.eachAsync(async (vr) => {
                var key = vr.key;
                var v = vr.ids;
                var sea = this.relationSchemas.find(g => g.id == key);
                if (sea) {
                    var rd = await sea.all({ page: 1, filter: { id: { $in: v } } });
                    if (rd.ok) {
                        this.relationDatas.set(key, rd.data.list);
                    }
                }
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
        if (this.createSource == 'InputBlockSelector' || this.createSource == 'pageTurnLayout') {
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
            await this.loadRelationSchemas();
            await this.loadRelationDatas();
            await this.createItem();
            this.view.forceUpdate();
        }
        console.log(this,'this');
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
    async onOpenAddForm() {
        var row = await useFormPage({
            schema: this.schema,
            recordViewId: this.schema.recordViews[0].id
        });
        if (row)
            await this.onAddRow(row, undefined, 'after');
    }
    async onOpenEditForm(id: string) {
        var rowData = this.data.find(g => g.id == id);
        var row = await useFormPage({
            schema: this.schema,
            recordViewId: this.schema.recordViews[0].id,
            row: rowData
        });
        if (row) await this.onRowUpdate(id, row);
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
            var fieldData = await this.schema.fieldAdd({
                text: result.text,
                type: result.type,
                config: result.config
            });
            if (fieldData.ok) {
                var field = new Field();
                field.load(Object.assign(result, fieldData.data.actions[0]));
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
                this.forceUpdate();
            }
        });
    }
    async onUpdateField(viewField: ViewField, data: Record<string, any>) {
        await this.page.onAction(ActionDirective.onSchemaUpdateField, async () => {
            await this.schema.fieldUpdate({ fieldId: viewField.field.id, data });
            viewField.field.load(data);
            await this.createItem();
            this.forceUpdate();
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
                    this.forceUpdate();
                }
            });
        }
    }
    async onHideField(viewField: ViewField) {
        await this.page.onAction(ActionDirective.onSchemaHideField, async () => {
            var fields = this.fields.map(f => f.clone());
            fields.remove(g => g.field?.id == viewField?.field.id);
            this.changeFields(this.fields, fields);
            await this.createItem();
            this.forceUpdate();
        });
    }
    async onShowField(field: Field) {
        if (this.fields.some(s => s.field.id == field.id)) return;
        await this.page.onAction(ActionDirective.onSchemaShowField, async () => {
            var fields = this.fields.map(f => f.clone());
            var newFeild = this.schema.createViewField(field);
            fields.push(newFeild);
            this.changeFields(this.fields, fields);
            await this.createItem();
            this.forceUpdate();
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
    async onTurnField(viewField: ViewField, type: FieldType, config?: Record<string, any>) {
        var field = viewField.field;
        await this.page.onAction(ActionDirective.onSchemaTurnField, async () => {
            console.log(type, config,)
            var r = await this.schema.turnField({ fieldId: field.id, type: type, config });
            if (r.ok) {
                field.type = type;
                if (config)
                    Object.assign(field.config, config);
                await this.loadData();
                await this.createItem();
                this.forceUpdate();
            }
        });
    }
    async onOpenConfigField(event: React.MouseEvent | MouseEvent, viewField: ViewField) {
        event.stopPropagation();
        var self = this;
        var rp = Rect.fromEvent(event);
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
            var fieldMenus = getFieldMenus();
            var fm = fieldMenus.find(g => g.value == viewField.field.type);
            fm.checkLabel = true;
            var icon = getTypeSvg(viewField?.field.type);
            var fieldSettingVisible: boolean = false;
            if ([FieldType.date].includes(viewField?.field.type)) {
                fieldSettingVisible = true;
            }
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemTypeValue.input,
                    value: viewField.field?.text,
                    text: '编辑列名',
                },
                { text: '字段类型', type: MenuItemTypeValue.text },
                { text: viewField.field.type == FieldType.title ? "标题" : fm.text, icon, childs: viewField.field.type == FieldType.title ? [] : fieldMenus },
                { icon: SettingsSvg, visible: fieldSettingVisible, text: fm?.text + '设置', name: 'fieldSetting' },
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
            if (viewField.field?.type == FieldType.date) {
                items.insertAt(3, {
                    text: '包括时间',
                    type: MenuItemTypeValue.switch,
                    name: 'includeTime',
                    checked: viewField?.field?.config?.includeTime ? true : false
                });
            }
            else if ([FieldType.file, FieldType.image, FieldType.audio, FieldType.video].includes(viewField.field?.type)) {
                items.insertAt(3, {
                    text: '多文件上传',
                    type: MenuItemTypeValue.switch,
                    name: 'isMultiple',
                    checked: viewField?.field?.config?.isMultiple ? true : false
                });
            }
        }
        var re = await useSelectMenuItem(
            {
                roundArea: rp,
                direction: 'left'
            },
            items,
            {
                async update(item) {
                    if (item.name == 'includeTime') {
                        var config = util.clone(viewField?.field?.config);
                        if (typeof config == 'undefined') config = {};
                        config.includeTime = item.checked;
                        await self.onUpdateField(viewField, { config });
                    }
                    else if (item.name == 'isMultiple') {
                        var config = util.clone(viewField?.field?.config);
                        if (typeof config == 'undefined') config = {};
                        config.isMultiple = item.checked;
                        await self.onUpdateField(viewField, { config });
                    }
                }
            }
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
            else if (re.item.name == 'turnFieldType') {
                if (re.item.value == viewField?.field?.type) return;
                if (re.item.value == FieldType.relation) {
                    var r = await useRelationView({ roundArea: rp }, {
                        config: viewField.field.config
                    });
                    if (r) {
                        await this.onTurnField(viewField, re.item.value, r.config);
                    }
                }
                else if (re.item.value == FieldType.rollup) {
                    var r = await useRollupView({ roundArea: rp }, {
                        schema: this.schema,
                        config: viewField.field.config
                    })
                    if (r) {
                        await this.onTurnField(viewField, re.item.value, r);
                    }
                }
                else if (re.item.value == FieldType.formula) {
                    var formula = await useFormula({ roundArea: rp }, {
                        schema: this.schema,
                        formula: viewField.field.config.formula
                    });
                    if (formula) {
                        await this.onTurnField(viewField, re.item.value, { formula });
                    }
                }
                else if (re.item.value == FieldType.emoji) {
                    var r = await useFieldEmojiView({ roundArea: rp }, {
                        schema: this.schema,
                        config: viewField.field.config
                    })
                    if (r) {
                        await this.onTurnField(viewField, re.item.value, r);
                    }
                }
                else {
                    this.onTurnField(viewField, re.item.value);
                }
            }
            else if (re.item.name == 'fieldSetting') {
                if (viewField?.field.type == FieldType.date) {
                    await this.onOpenConfigFieldSettings(rp, viewField);
                }
            }
            if (ReItem.value != viewField.field?.text) {
                //编辑列名了
                this.onUpdateField(viewField, { text: ReItem.value })
            }
        }
    }
    async onOpenConfigFieldSettings(event: MouseEvent | MouseEvent | Rect, viewField: ViewField) {
        console.log(event);
        switch (viewField?.field?.type) {
            case FieldType.date:
                var items: MenuItemType<BlockDirective | string>[] = [];
                var day = dayjs(new Date());
                items.push(...[
                    {
                        name: 'name',
                        type: MenuItemTypeValue.input,
                        value: viewField?.field?.config?.dateFormat || 'YYYY年MM月DD日',
                        text: '编辑日期格式',
                    },
                    { type: MenuItemTypeValue.divide },
                    {
                        name: 'format',
                        text: '年月日',
                        value: 'YYYY年MM月DD日',
                        label: day.format('YYYY年MM月DD日')
                    },
                    {
                        name: 'format',
                        text: '年月',
                        value: 'YYYY年MM月',
                        label: day.format('YYYY年MM月')
                    },
                    {
                        name: 'format',
                        text: '月日',
                        value: 'MM月DD日',
                        label: day.format('MM月DD日')
                    },
                    {
                        name: 'format',
                        text: '日期时间',
                        value: 'YYYY/MM/DD HH:mm',
                        label: day.format('YYYY/MM/DD HH:mm')
                    },
                    {
                        name: 'format',
                        text: '时间',
                        value: 'HH:mm',
                        label: day.format('HH:mm')
                    }
                ]);
                var re = await useSelectMenuItem(
                    {
                        roundArea: event instanceof Rect ? event : Rect.fromEvent(event),
                        direction: 'left'
                    },
                    items
                );
                if (re?.item.name == 'format') {
                    var config = util.clone(viewField?.field?.config);
                    if (typeof config == 'undefined') config = {};
                    config.dateFormat = re.item.value;
                    await this.onUpdateField(viewField, { config });
                    this.forceUpdate()
                }
                else {
                    if (items[0].value != viewField?.field.config?.dateFormat) {
                        var config = util.clone(viewField?.field?.config);
                        if (typeof config == 'undefined') config = {};
                        config.dateFormat = items[0].value;
                        await this.onUpdateField(viewField, { config });
                        this.forceUpdate()
                    }
                }
                break;
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
    async onChangeFields(oldFields: ViewField[], newFields: ViewField[]) {
        await this.onAction(ActionDirective.onDataGridChangeFields, async () => {
            this.changeFields(oldFields, newFields);
            await this.createItem();
            this.forceUpdate();
        })
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
        this.page.emit(PageDirective.selectRows, this, this.checkItems)
    }
    async onChangeIndex(index: number) {
        this.index = index;
        this.emit('changeIndex', this.index);
        await this.loadData();
        this.forceUpdate();
    }
    async onChangeSize(size: number) {
        this.onAction(ActionDirective.onDataGridChangeSize, async () => {
            this.updateProps({ size });
            await this.loadData();
            await this.createItem();
            this.forceUpdate();
        })
    }
    async onSearch() {

    }
    async onOver(isOver: boolean) {
        if (this.dataGridTool && this.dataGridTool.isOpenTool) return;
        this.isOver = isOver;
        if (this.dataGridTool) this.dataGridTool.forceUpdate();
    }
    dataGridTool: DataGridTool;
}

