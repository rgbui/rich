import { useDataGridSelectView } from "../../../../extensions/data-grid/create";
import { channel } from "../../../../net/channel";
import { Block } from "../../../../src/block";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { prop } from "../../../../src/block/factory/observable";
import { Pattern } from "../../../../src/block/pattern";
import { Rect } from "../../../../src/common/vector/point";
import { ActionDirective } from "../../../../src/history/declare";
import { SchemaFilter } from "../../schema/declare";
import { TableSchema } from "../../schema/meta";
import { ViewField } from "../../schema/view";
import { DataGridTurns } from "../../turn";
import { TableStoreItem } from "../item";
import { DataGridTool } from "../components/tool";
import { Mix } from "../../../../util/mix";
import { DataGridViewLife } from "./left.cycle";
import { DataGridViewOperator } from "./operator";
import { DataGridViewData } from "./data";
import { DataGridViewConfig } from "./config";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { DataGridViewField } from "./field";
import lodash from "lodash";
import { OriginFilterField } from "../../element/filter/origin.field";
import { FilterSort } from "../../element/filter/sort";
import { Page } from "../../../../src/page";
import { Field } from "../../schema/field";
import { useCreateDataGrid } from "../../../../extensions/data-grid/create/view";
import { AtomPermission } from "../../../../src/page/permission";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { OptionDefineRule } from "../../block/optionRule";
import { FieldType } from "../../schema/type";
import { Input } from "../../../../component/view/input";

/**
 * 
 * schema  table fields meta
 * syncBlockId ViewFields （控制展示的数据结构信息）
 * block fields(控制列宽)
 * show view(schema->syncBlock->block)
 * 
 */
export class DataGridView extends Block {
    checkItems: Record<string, any>[] = [];
    viewProps: string[] = ['url', 'filter', 'noTitle', 'openRecordSource', 'openRecordViewId', ' createRecordSource', 'size', 'sorts'];
    @prop()
    fields: ViewField[] = [];
    @prop()
    sorts: { id: string, field: string, sort: number }[] = [];
    @prop()
    filter: SchemaFilter = {};
    @prop()
    schemaId: string;
    @prop()
    showRowNum: boolean = false;
    @prop()
    checkRow: 'none' | 'checkbox' | 'selected' = 'none';
    @prop()
    noTitle: boolean = false;
    @prop()
    openRecordSource: Page['openSource'] = 'dialog';
    @prop()
    openRecordViewId: string = '';
    @prop()
    createRecordSource: Page['openSource'] = 'dialog';
    schema: TableSchema;
    relationSchemas: TableSchema[] = [];
    relationDatas: Map<string, any[]> = new Map();
    isOver: boolean = false;
    searchTitle: { input: Input, focus: boolean, word: string } = { input: null, focus: false, word: '' };
    async onGetTurnUrls() {
        return [];
        // return DataGridTurns.urls
    }
    async getWillTurnData(url: string) {
        return await DataGridTurns.turn(this, url);
    }
    get schemaView() {
        if (this.schema) return this.schema.views.find(g => g.id == this.syncBlockId);
    }
    data: Record<string, any>[] = [];
    userEmojis: Record<string, string[]> = {};
    isLoadingData: boolean = false;
    async onLoadingAction(fn: () => Promise<void>) {
        this.isLoadingData = true;
        if (this.isMounted) this.forceUpdate()
        try {
            await fn();
        }
        catch (ex) {
            console.error(ex)
        }
        this.isLoadingData = false;
        if (this.isMounted) this.forceUpdate()
    }
    isEmoji(field: Field, rowId: string) {
        var isOp = this.userEmojis[field.name]?.includes(rowId)
        return isOp;
    }
    pageIndex: number = 1;
    @prop()
    size: number = 50;
    total: number = 0;
    init(this: DataGridView): void {
        super.init();
        this.registerPropMeta('fields', undefined, true, (v) => {
            var d = new ViewField(v, this.schema);
            return d;
        });
    }
    async load(this: DataGridView, data) {
        if (!this.pattern) this.pattern = new Pattern(this);
        for (var n in data) {
            if (n == 'pattern') {
                await this.pattern.load(data[n]);
            }
            else if (n == 'blocks') {
                this.blocks = { childs: [] };
            }
            else await this.setPropData(n, data[n]);
        }
    }

    async get(this: DataGridView) {
        var json: Record<string, any> = {
            id: this._id,
            syncBlockId: this.syncBlockId,
            url: this.url,
            schemaId: this.schemaId,
            matrix: this.matrix ? this.matrix.getValues() : undefined
        };
        if (typeof this.pattern.get == 'function')
            json.pattern = await this.pattern.get();
        json.blocks = {};
        if (Array.isArray(this.__props)) {
            var ss = super.__props;
            await this.__props.eachAsync(async pro => {
                if (ss.includes(pro) || this.viewProps.includes(pro))
                    json[pro] = await this.clonePropData(pro, this[pro]);
            })
        }
        return json;
    }
    async getSync() {
        var json: Record<string, any> = { url: this.url };
        if (typeof this.pattern.get == 'function')
            json.pattern = await this.pattern.get();
        json.blocks = {};
        if (Array.isArray(this.__props)) {
            await this.__props.eachAsync(async pro => {
                if (!this.viewProps.includes(pro))
                    json[pro] = await this.clonePropData(pro, this[pro]);
            })
        }
        return json;
    }
    async getSyncString() {
        return JSON.stringify(await this.getSync());
    }
    async loadSyncBlock(this: DataGridView): Promise<void> {
        if (this.syncBlockId) {
            var r = await channel.get('/view/snap/query', { ws: this.page.ws, elementUrl: this.elementUrl });
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
                    if (this.viewProps.includes(n)) continue;
                    if (n == 'pattern') {
                        await this.pattern.load(data[n]);
                    }
                    else if (n == 'blocks') {
                        this.blocks = { childs: [] };
                    }
                    else await this.setPropData(n, data[n]);
                }
                if (Array.isArray(r.data.operates) && r.data.operates.length > 0)
                    await this.page.onSyncUserActions(r.data.operates, 'loadSyncBlock');
            }
        }
        else await super.loadSyncBlock();

    }
    getSearchFilter() {
        var f: SchemaFilter = {} as any;
        if (this.filter) {
            f = lodash.cloneDeep(this.filter);
        }
        var fs = this.referenceBlockers.findAll(g => !(g instanceof FilterSort) && g instanceof OriginFilterField);
        var rs: SchemaFilter[] = [];
        if (fs.length > 0) {
            fs.forEach(f => {
                var fl = (f as OriginFilterField).filters;
                if (fl) {
                    rs.push(...fl);
                }
            })
        }
        var ru = this.referenceBlockers.find(g => g.url == BlockUrlConstant.DataGridOptionRule) as OptionDefineRule
        if (ru) {
            var fl = ru.getFilters();
            if (fl) {
                rs.push(...fl);
            }
        }
        if (this.searchTitle?.focus && this.searchTitle?.word)
        {
            rs.push({
                field: this.schema.fields.find(g => g.name == 'title')?.id,
                value: this.searchTitle.word,
                operator: '$startWith'
            })
        }
        if (f && rs.length > 0) {
            if (f.logic == 'and') {
                f.items.push(...rs);
            }
            else if (f.logic == 'or') {
                f = { logic: 'and', items: [f, ...rs] };
            }
            else {
                f = { logic: 'and', items: [...rs] }
            }
        }
        var ef = (g: SchemaFilter) => {
            if (typeof g.value != 'undefined') {
                var gf = this.schema.fields.find(c => c.id == g.field)
                if (Array.isArray(g.value)) {
                    if (g.value.some(s => typeof s == 'string' && s.startsWith('@'))) {
                        g.value = g.value.map(s => {
                            if (typeof s == 'string' && s.startsWith('@') && this.page.schema && this.page.formRowData) {
                                var f = this.page.schema.fields.find(c => '@' + c.text == s);
                                if (f) {
                                    if ([FieldType.option, FieldType.options].includes(gf.type)) {
                                        var ops = gf.config?.options.find(c => '@' + c.text == g.value);
                                        if (ops) {
                                            return ops.value;
                                        }
                                    }
                                    else
                                        return this.page.formRowData[f.name];
                                }
                            }
                            return s;
                        })
                    }
                }
                else if (g.value && typeof g.value == 'string' && g.value.startsWith('@') && this.page.schema && this.page.formRowData) {
                    var f = this.page.schema.fields.find(c => '@' + c.text == g.value);
                    if (f) {
                        if ([FieldType.option, FieldType.options].includes(gf.type)) {
                            var ops = gf.config?.options.find(c => '@' + c.text == g.value);
                            if (ops) {
                                g.value = ops.value;
                            }
                        }
                        else g.value = this.page.formRowData[f.name];
                    }
                }
            }
            if (Array.isArray(g.items)) {
                g.items.forEach(gg => {
                    ef(gg)
                })
            }
        }
        ef(f);
        return f
    }
    getSearchSorts() {
        var sorts: Record<string, any> = {};
        if (Array.isArray(this.sorts) && this.sorts.length > 0) {
            this.sorts.forEach(s => {
                var f = this.schema.fields.find(g => g.id == s.field);
                if (f) {
                    sorts[f.name] = s.sort;
                }
            })
            return sorts;
        }
        var sfs = this.referenceBlockers.findAll(g => g instanceof FilterSort || g.url == BlockUrlConstant.DataGridLatestOrHot) as FilterSort[];
        if (sfs) {
            for (let sf of sfs) {
                var so = sf.getSort();
                if (so) Object.assign(sorts, so);
            }
        }
        return sorts;
    }
    async createItem() {
        this.blocks.childs = [];
        for (let i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            var rowBlock: TableStoreItem = await BlockFactory.createBlock('/data-grid/item', this.page, {
                mark: i,
                dataId: row.id
            }, this) as TableStoreItem;
            this.blocks.childs.push(rowBlock);
            await rowBlock.createElements();
        }
    }
    async createdDidMounted(): Promise<void> {
        if (this.createSource == 'InputBlockSelector' || this.createSource == 'pageTurnLayout') {
            if (!this.schemaId) {
                await this.onCreateTableSchema();
            }
        }
    }
    async didMounted(force: boolean = true) {
        await this.loadDataGrid(force);
    }
    async loadDataGrid(force: boolean = true) {
        await this.loadSchema();
        if (this.schema) {
            await this.loadViewFields();
            await this.loadData();
            await this.loadRelationSchemas();
            await this.loadRelationDatas();
            await this.loadDataInteraction();
            await this.createItem();
            await this.onNotifyReferenceBlocks();
            if (this.view && force) this.view.forceUpdate();
        }
        this.emit('loadDataGrided');
    }
    async onAddCreateTableView() {
        var r = Rect.fromEle(this.el);
        var newRect = new Rect(r.left, r.top - (this.noTitle ? 40 : 0), r.width, 40);
        var dg = await useCreateDataGrid(
            { roundArea: newRect },
            { selectView: true, schema: this.schema }
        );
        if (dg) {
            if (dg.source == 'dataView') await this.onSchemaViewCreateByTemplate(dg.text, dg.url)
            else await this.onSchemaViewCreate(dg.text, dg.url);
        }
    }
    willCreateSchema: boolean = false;
    async onCreateTableSchema() {
        if (!this.schemaId) {
            var dg = await useDataGridSelectView({ roundArea: Rect.fromEle(this.el) }, { selectView: this.createSource == 'InputBlockSelector' ? false : true });
            if (dg) {
                this.willCreateSchema = true;
                if (this.view) this.view.forceUpdate();
                if (dg.schemaId) {
                    await this.page.onAction('SelectTableSchema', async () => {
                        this.updateProps({
                            schemaId: dg.schemaId,
                            syncBlockId: dg.syncBlockId
                        })
                    })
                }
                else {
                    this.schema = await TableSchema.onCreate({ text: dg.text, url: this.url });
                    await this.page.onAction(ActionDirective.onCreateTableSchema, async () => {
                        this.updateProps({
                            schemaId: this.schema.id,
                            syncBlockId: this.schema.views.first().id
                        })
                    });
                }
                await this.loadDataGrid();
                this.willCreateSchema = false;
                if (this.view) this.view.forceUpdate();
            }
        }
    }
    dataGridTool: DataGridTool;
    async onTableSchemaLock(this: DataGridView, locked: boolean) {
        await this.schema.onSchemaOperate([
            {
                name: 'updateSchema',
                id: this.schema.id,
                data: {
                    locker: {
                        lock: locked,
                        date: Date.now(),
                        userid: this.page.user.id
                    }
                }
            }
        ]);
        this.forceUpdate()
    }
    get elementUrl() {
        return getElementUrl(ElementType.SchemaView, this.schemaId, this.syncBlockId);
    }
    getCardUrl() {
        return undefined;
    }
    isCanLocker() {
        if (this.schema?.locker?.lock == true) return true;
        return false;
    }
    dataGridIsCanEdit() {
        return this.isCanEdit() && !this.isCanLocker()
    }
    isCanAddRow() {
        if (!this.page.isSign) return false;
        if (this.isCanLocker()) return false;
        return this.isAllow(AtomPermission.dbAddRow)
    }
    isCanEditRow(row) {
        if (!this.page.isSign) return false;
        if (this.isCanLocker()) return false;
        if (row && row.creater == this.page.user.id) return true;
        return this.isAllow(AtomPermission.dbEditRow)
    }
    async getMd() {
        var ws = this.page.ws;
        return `[${this.schemaView?.text}](${ws.url + '/resource?elementUrl=' + window.encodeURIComponent(this.elementUrl)})`
    }
    onSyncAddRow = lodash.debounce(async (data, id?: string, arrow: 'before' | 'after' = 'after') => {
        await this.onAddRow(data, id, arrow)
    }, 1000)
    onLazySearch = lodash.debounce(async () => {
        await this.onSearch()
    },700);
}

export interface DataGridView extends DataGridViewLife { }
export interface DataGridView extends DataGridViewOperator { }
export interface DataGridView extends DataGridViewData { }
export interface DataGridView extends DataGridViewConfig { }
export interface DataGridView extends DataGridViewField { }
Mix(DataGridView, DataGridViewLife, DataGridViewOperator, DataGridViewData, DataGridViewConfig, DataGridViewField)