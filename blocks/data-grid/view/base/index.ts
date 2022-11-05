import { useDataGridCreate } from "../../../../extensions/data-grid/create";
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
import { PageLayoutType } from "../../../../src/page/declare";

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
    pageIndex: number = 1;
    @prop()
    size: number = 50;
    total: number = 0;
    init(this: DataGridView): void {
        super.init();
        this.registerPropMeta('fields', undefined, true, (v) => {
            return new ViewField(v, this.schema);
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
            await this.loadSyncBlock();
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
            this.__props.each(pro => {
                if (ss.includes(pro) || pro == 'size')
                    json[pro] = this.clonePropData(pro, this[pro]);
            })
        }
        return json;
    }
    async getSyncString() {
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
        return JSON.stringify(json);
    }
    async loadSyncBlock(this: DataGridView): Promise<void> {
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
                this.page.syncUserActions(r.data.operates, 'load');
        }
    }
    getSearchFilter() {
        var f: Record<string, any> = {}
        if (this.filter) {
            f = lodash.cloneDeep(this.filter);
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
            return lodash.cloneDeep(this.sorts);
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
                var dg = await useDataGridCreate({ roundArea: Rect.fromEle(this.el) });
                if (dg) {
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
    async didMounted() {
        await this.loadSchema();
        if (this.schema) {
            await this.loadViewFields();
            await this.loadData();
            await this.loadRelationSchemas();
            await this.loadRelationDatas();
            await this.createItem();
            await this.onNotifyReferenceBlocks();
            if (this.view)
                this.view.forceUpdate();
        }
    }
    async onAddCreateTableView() {
        var dg = await useDataGridCreate({ roundArea: Rect.fromEle(this.el) }, { selectView: true });
        if (dg) {
            await this.onSchemaViewCreate(dg.text, dg.url);
        }
    }
    async onCreateTableSchema() {
        if (!this.schemaId) {
            var dg = await useDataGridCreate({ roundArea: Rect.fromEle(this.el) });
            if (dg) {
                this.schema = await TableSchema.onCreate({ text: dg.text, url: this.url });
                await this.page.onAction(ActionDirective.onCreateTableSchema, async () => {
                    this.updateProps({
                        schemaId: this.schema.id,
                        syncBlockId: this.schema.views.first().id
                    })
                });
                await this.didMounted();
            }
        }
    }
    dataGridTool: DataGridTool;
    async onDataViewLock(this: DataGridView, locked: boolean) {
        await this.schema.onSchemaOperate([
            {
                name: 'updateSchemaView',
                id: this.schemaView.id,
                data: {
                    lock: locked,
                    date: Date.now(),
                    userid: this.page.user.id
                }
            }
        ]);
        this.forceUpdate()
    }
    get elementUrl() {
        return getElementUrl(ElementType.SchemaView, this.schemaId, this.syncBlockId);
    }
    isCanEdit(prop?: string) {
        if (this.page?.pageLayout.type == PageLayoutType.dbPickRecord) return false;
        if (this.schemaView?.locker) return false;
        var r = super.isCanEdit(prop);
        return r;
    }
}

export interface DataGridView extends DataGridViewLife { }
export interface DataGridView extends DataGridViewOperator { }
export interface DataGridView extends DataGridViewData { }
export interface DataGridView extends DataGridViewConfig { }
export interface DataGridView extends DataGridViewField { }
Mix(DataGridView, DataGridViewLife, DataGridViewOperator, DataGridViewData, DataGridViewConfig, DataGridViewField)