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
import { BlockUrlConstant } from "../../../../src/block/constant";
import { useCreateDataGrid } from "../../../../extensions/data-grid/create/view";
import { AtomPermission } from "../../../../src/page/permission";

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
    createRecordSource: Page['openSource'] = 'dialog';
    schema: TableSchema;
    relationSchemas: TableSchema[] = [];
    relationDatas: Map<string, any[]> = new Map();
    isOver: boolean = false;
    async onGetTurnUrls() {
        return [];
        // return DataGridTurns.urls
    }
    async getWillTurnData(url: string) {
        return await DataGridTurns.turn(this, url);
    }
    get schemaView() {
        if (this.schema)
            return this.schema.views.find(g => g.id == this.syncBlockId);
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
            else this.setPropData(n, data[n]);
        }
        if (this.syncBlockId) {
            // await this.loadSyncBlock();
        }
    }
    async get(this: DataGridView) {
        if (this.url == BlockUrlConstant.FormView) return await super.get();
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
            this.__props.each(pro => {
                if (ss.includes(pro) || pro == 'size')
                    json[pro] = this.clonePropData(pro, this[pro]);
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
            this.__props.each(pro => {
                if (pro !== 'size')
                    json[pro] = this.clonePropData(pro, this[pro]);
            })
        }
        return json;
    }
    async getSyncString() {
        if (this.url == BlockUrlConstant.FormView) return await super.getSyncString();
        return JSON.stringify(await this.getSync());
    }
    async loadSyncBlock(this: DataGridView): Promise<void> {
        if (this.syncBlockId) {
            if (this.url == BlockUrlConstant.FormView) return await super.loadSyncBlock();
            var r = await channel.get('/view/snap/query', { elementUrl: this.elementUrl });
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
                    else if (n == 'blocks') {
                        this.blocks = { childs: [] };
                    }
                    else this.setPropData(n, data[n]);
                }
                if (Array.isArray(r.data.operates) && r.data.operates.length > 0)
                    this.page.onSyncUserActions(r.data.operates, 'loadSyncBlock');
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
        var sf = this.referenceBlockers.find(g => g instanceof FilterSort) as FilterSort;
        if (sf) {
            var so = sf.getSort();
            if (so) Object.assign(sorts, so);
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
                var dg = await useDataGridSelectView({ roundArea: Rect.fromEle(this.el) }, { selectView: this.createSource == 'InputBlockSelector' ? false : true });
                if (dg) {
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
            await this.loadDataInteraction();
            await this.createItem();
            await this.onNotifyReferenceBlocks();
            if (this.view) this.view.forceUpdate();
        }
    }
    async onAddCreateTableView() {
        var dg = await useCreateDataGrid(
            { roundArea: Rect.fromEle(this.el) },
            { selectView: true }
        );
        if (dg) {
            await this.onSchemaViewCreate(dg.text, dg.url);
        }
    }
    async onCreateTableSchema() {
        if (!this.schemaId) {
            var dg = await useDataGridSelectView({ roundArea: Rect.fromEle(this.el) });
            if (dg) {
                await this.page.onAction(ActionDirective.onCreateTableSchema, async () => {
                    if (dg.schemaId) this.schema = await TableSchema.loadTableSchema(dg.schemaId)
                    else this.schema = await TableSchema.onCreate({ text: dg.text, url: this.url });
                    this.updateProps({
                        schemaId: this.schema.id,
                        syncBlockId: dg.syncBlockId || this.schema.views.first().id
                    })
                });
                await this.didMounted();
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
        var ws = channel.query('/current/workspace')
        return `[${this.schemaView?.text}](${ws.url + '/resource?elementUrl=' + window.encodeURIComponent(this.elementUrl)})`
    }
    onSyncAddRow = lodash.debounce(async (data, id?: string, arrow: 'before' | 'after' = 'after', dialogPage: Page = null) => {
        await this.onAddRow(data, id, arrow, dialogPage)
    }, 1000)
}

export interface DataGridView extends DataGridViewLife { }
export interface DataGridView extends DataGridViewOperator { }
export interface DataGridView extends DataGridViewData { }
export interface DataGridView extends DataGridViewConfig { }
export interface DataGridView extends DataGridViewField { }
Mix(DataGridView, DataGridViewLife, DataGridViewOperator, DataGridViewData, DataGridViewConfig, DataGridViewField)