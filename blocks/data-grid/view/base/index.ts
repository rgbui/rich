import { useDataGridCreate } from "../../../../extensions/data-grid/create/select.view";
import { channel } from "../../../../net/channel";
import { Block } from "../../../../src/block";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { prop } from "../../../../src/block/factory/observable";
import { Pattern } from "../../../../src/block/pattern";
import { Point, Rect } from "../../../../src/common/vector/point";
import { SchemaFilter } from "../../schema/filter";
import { DataStoreAction, SchemaAction, TableSchema } from "../../schema/meta";
import { ViewField } from "../../schema/view";
import { DataGridTurns } from "../../turn";
import { TableGridItem } from "../item";
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
import { useCreateDataGridView } from "../../../../extensions/data-grid/create/view";
import { AtomPermission } from "../../../../src/page/permission";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { OptionDefineRule } from "../../block/optionRule";
import { FieldType } from "../../schema/type";
import { Input } from "../../../../component/view/input";
import { onCreateDataGridTemplate } from "../../template/create";
import { DataGridTab } from "../tab";
import { PageLayoutType } from "../../../../src/page/declare";
import { GroupHeadType, GroupViewType } from "../declare";
import { util } from "../../../../util/util";
import { DataGridTableItem } from "../table/row";
import { OriginField } from "../../element/field/origin.field";

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
    viewProps: string[] = [
        'url',
        // 'filter',
        // 'sorts',
        'noTitle',
        // 'openRecordSource',
        // 'openRecordViewId',
        // 'createRecordSource',
        'size'
    ];
    @prop()
    fields: ViewField[] = [];
    @prop()
    sorts: { id: string, field: string, sort: number }[] = [];
    @prop()
    filter: SchemaFilter = {};
    @prop()
    schemaId: string;
    @prop()
    groupView: GroupViewType;
    get hasGroup() {
        if (Array.isArray(this.schema?.fields))
            return this.groupView?.groupId && this.schema?.fields.find(g => g.id == this.groupView.groupId)
    }
    @prop()
    showRowNum: boolean = false;
    @prop()
    checkRow: 'none' | 'checkbox' | 'selected' = 'none';
    @prop()
    noTitle: boolean = false;
    @prop()
    breakRow: boolean = false;
    @prop()
    openRecordSource: Page['openSource'] = 'dialog';
    @prop()
    openRecordViewId: string = '';
    @prop()
    createRecordSource: Page['openSource'] = 'dialog';
    @prop()
    cardSettings: Record<string, any> = {};
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
    get isSchemaViewError() {
        if (this.schema && this.syncBlockId) return !this.schema.views.some(s => s.id == this.syncBlockId);
    }
    data: Record<string, any>[] = [];
    dataGroupHeads: GroupHeadType[] = [];
    userEmojis: Record<string, string[]> = {};
    isLoadingData: boolean = false;
    async onLoadingAction(fn: () => Promise<void>) {
        this.isLoadingData = true;
        if (this.isMed) this.forceManualUpdate()
        try {
            await fn();
        }
        catch (ex) {
            console.error(ex)
        }
        this.isLoadingData = false;
        if (this.isMed) this.forceManualUpdate()
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
            var ss = super.getCurrentProps();
            await this.__props.eachAsync(async pro => {
                if (ss.includes(pro) || this.viewProps.includes(pro))
                    json[pro] = await this.clonePropData(pro, this[pro]);
            })
        }
        return json;
    }
    async cloneData(options?: { isButtonTemplate?: boolean; }) {
        var json: Record<string, any> = {
            // id: this._id,
            syncBlockId: this.syncBlockId,
            url: this.url,
            schemaId: this.schemaId,
            matrix: this.matrix ? this.matrix.getValues() : undefined
        };
        if (typeof this.pattern.get == 'function')
            json.pattern = await this.pattern.cloneData();
        json.blocks = {};
        if (Array.isArray(this.__props)) {
            var ss = super.getCurrentProps();
            await this.__props.eachAsync(async pro => {
                if (ss.includes(pro) || this.viewProps.includes(pro)) {
                    try {
                        json[pro] = await this.clonePropData(pro, this[pro]);
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                }
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
            lodash.remove(this.page.snapLoadLocker, s => s.date + 1000 * 30 < Date.now());
            var rc = this.page.snapLoadLocker.find(s => s.url == this.elementUrl);
            if (rc) {
                if (rc.date + 1000 * 5 > Date.now()) {
                    if (rc.count > 10) {
                        this.page.onError(new Error('数据加载失败，请稍后再试'));
                        return;
                    }
                    else { rc.count += 1; rc.date = Date.now(); }
                }
                else { rc.date = Date.now(); rc.count = 0; }
            }
            else this.page.snapLoadLocker.push({ url: this.elementUrl, count: 0, date: Date.now() })

            var r = await channel.get('/view/snap/query', { ws: this.page.ws, elementUrl: this.elementUrl });
            if (window.shyConfig?.isDev)
                console.log('datagrid syncBlock', r, this);
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
                var ops = r.data.operates;
                if (Array.isArray(ops) && ops.length > 0)
                    lodash.remove(ops, op => op.directive == "onDataGridChangeView" || op.directive == 'onDataGridChangeViewByTemplate' || op.directive == 'SelectTableSchema' || op.directive == 125);
                if (Array.isArray(ops) && ops.length > 0)
                    await this.page.onSyncUserActions(ops, 'loadSyncBlock');
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
        if (this.searchTitle?.focus && this.searchTitle?.word) {
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
                var name = g.field?.indexOf('.') > -1 ? g.field.split('.')[0] : g.field;
                var gf = this.schema.fields.find(c => c.id == name)
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
        var sorts: Record<string, any> = { sort: -1 };
        if (Array.isArray(this.sorts) && this.sorts.length > 0) {
            this.sorts.forEach(s => {
                var sn = s.field.indexOf('.') > -1 ? s.field.split('.')[0] : s.field;
                var sub = s.field.indexOf('.') > -1 ? s.field.split('.')[1] : '';
                var f = this.schema.fields.find(g => g.id == sn);
                if (f) {
                    sorts[f.name + (sub ? "." + sub : "")] = s.sort;
                }
            })
        }
        var sfs = this.referenceBlockers.findAll(g => g instanceof FilterSort || g.url == BlockUrlConstant.DataGridLatestOrHot) as FilterSort[];
        if (sfs) {
            for (let sf of sfs) {
                var so = sf.getSort();
                if (so) Object.assign(sorts, so);
            }
        }
        if (Object.keys(sorts).length > 1) {
            delete sorts.sort;
        }
        return sorts;
    }
    /**
     * 将数据重新渲染到数据表格中...
     */
    async createItem(isForce?: boolean) {
        this.blocks.childs = [];
        var ds = this.data.filter(g => g.parentId ? false : true);
        var subUrl = '/data-grid/item';
        if (this.url == BlockUrlConstant.DataGridTable) {
            subUrl = '/data-grid/table/row'
        }
        else if (this.url == BlockUrlConstant.DataGridList) {
            subUrl = '/data-grid/list/row'
        }
        else if (this.url == BlockUrlConstant.DataGridCalendar) {
            subUrl = '/data-grid/calendar/item'
        }
        for (let i = 0; i < ds.length; i++) {
            var row = ds[i];
            var rowBlock: TableGridItem = await BlockFactory.createBlock(subUrl, this.page, {
                mark: i,
                dataId: row.id
            }, this) as TableGridItem;
            this.blocks.childs.push(rowBlock);
            await rowBlock.createElements();
        }
        if (isForce) {
            this.forceManualUpdate();
        }
    }
    async createOneItem(data: Record<string, any>, isForce?: boolean) {
        var subUrl = '/data-grid/item';
        if (this.url == BlockUrlConstant.DataGridTable) {
            subUrl = '/data-grid/table/row'
        }
        else if (this.url == BlockUrlConstant.DataGridList) {
            subUrl = '/data-grid/list/row'
        }
        else if (this.url == BlockUrlConstant.DataGridCalendar) {
            subUrl = '/data-grid/calendar/item'
        }
        var at = this.blocks.childs.findIndex(g => (g as TableGridItem).dataId == data.id);
        if (at > -1) {
            this.blocks.childs.splice(at, 1);
        }
        else {
            var c = this.data.findIndex(g => g.id == data.id);
            if (c > -1) at = c;
        }
        var rowBlock: TableGridItem = await BlockFactory.createBlock(subUrl, this.page, {
            mark: this.data.length,
            dataId: data.id
        }, this) as TableGridItem;
        if (at == -1) at = this.blocks.childs.length;
        this.blocks.childs.splice(at, 0, rowBlock);
        await rowBlock.createElements(isForce);
        if (isForce) this.forceManualUpdate();
    }
    async createRowsItem(isForce?: boolean) {
        for (let c of this.blocks.childs) {
            await (c as DataGridTableItem).createElements(isForce)
        }
        if (isForce) {
            this.forceManualUpdate();
        }
    }
    async deleteOneItem(data: Record<string, any> | (Record<string, any>[]), isForce?: boolean) {
        var ds = util.covertToArray(data);
        var cs = this.blocks.childs.findAll(g => ds.some(d => d.id == (g as TableGridItem).dataId));
        lodash.remove(this.blocks.childs, g => ds.some(d => d.id == (g as TableGridItem).dataId));
        if (isForce && cs.length > 0) {
            this.forceManualUpdate();
        }
    }
    async createdDidMounted(): Promise<void> {
        if (this.createSource == 'InputBlockSelector' || this.createSource == 'pageTurnLayout') {
            if (!this.schemaId) {
                await this.onCreateTableSchema();
            }
        }
    }
    async didMounted() {
        await this.onBlockLoadData(async () => {
            await this.loadDataGrid();
            channel.sync('/datastore/operate', this.syncDatastore as any);
            channel.sync('/schema/operate', this.syncDataSchema as any);
        })
    }
    async didUnmounted() {
        channel.off('/datastore/operate', this.syncDatastore as any);
        channel.off('/schema/operate', this.syncDataSchema as any);
    }
    isLoading: boolean = false;
    async loadDataGrid() {
        try {
            this.isLoading = true;
            if (this.view) this.forceManualUpdate()
            await this.loadSchema();
            if (this.schema) {
                await this.loadViewFields();
                await this.loadRelationSchemas();
                await this.loadDataGridData();
                await this.createItem();
                await this.onNotifyReferenceBlocks();
            }
            this.emit('loadDataGrided');
        }
        catch (ex) {

        }
        finally {
            this.isLoading = false;
            if (this.view) this.forceManualUpdate()
        }
    }
    async onAddCreateTableView(rect?: Rect) {
        var r = rect || Rect.fromEle(this.el);
        var newRect = new Rect(r.left, r.top - (this.noTitle ? 40 : 0), r.width, 40);
        var dg = await useCreateDataGridView(
            { roundArea: newRect },
            { schema: this.schema }
        );
        if (dg) {
            await this.onSchemaViewCreate(dg.text, dg.url);
        }
    }
    willCreateSchema: boolean = false;
    async onCreateTableSchema() {
        if (this.willCreateSchema) return;
        this.willCreateSchema = true;
        try {
            if (!this.schema) {
                /***
                 * 
                 * 这里表示对于当前的块进行创建或选择数据表视图
                 * 由于更换后的block有syncBlockId，导致对当前的操作判断为syncBlockId中的视图actions，而不是page的action,
                 * 所以加上disabledSyncBlock: true
                 * 注意onOpenAddTabView也会有同样的问题
                 * 数据表视图本身是明确时候，如果更新视图的属性或其它操作应该归属于数据视图的action，
                 * 如果是更新数据视图，该action应该归为page的action操作
                 */
                await this.onDataGridCreate()
            }
        }
        catch (ex) {

        }
        finally {
            this.willCreateSchema = false;
        }
    }
    async onDataGridCreate(rect?: Rect) {
        if (!rect) {
            rect = Rect.fromEle(this.el);
            rect = new Rect(rect.left, rect.top, 200, 40)
        }
        var dg = await useDataGridCreate({ roundArea: rect }, { url: this.url, page: this.page });
        if (dg) {
            if (this.view) this.view.forceUpdate();
            var viewUrl: string = '';
            if (dg.schemaId) {
                viewUrl = dg.url;
                await this.page.onReplace(this, {
                    url: dg.url,
                    schemaId: dg.schemaId,
                    syncBlockId: dg.syncBlockId
                }, async (b) => {
                    if ((b as DataGridView).dataGridTab)
                        await (b as DataGridView).dataGridTab.updateTabItems((b as DataGridView))
                }, {
                    disabledSyncBlock: true
                })
            }
            else if (dg.source == 'dataView') {
                var view = await onCreateDataGridTemplate(dg.text, this, dg.url)
                viewUrl = view.url;
            }
            else if (dg.source == 'createView') {
                var schema = await TableSchema.onCreate({ text: dg.text, url: this.url });
                var view = schema.listViews.first();
                viewUrl = view.url;
                await this.page.onReplace(this, {
                    url: viewUrl,
                    schemaId: schema.id,
                    syncBlockId: view.id
                }, async (b) => {
                    if ((b as DataGridView).dataGridTab)
                        await (b as DataGridView).dataGridTab.updateTabItems((b as DataGridView))
                }, {
                    disabledSyncBlock: true
                })
            }
            if (viewUrl == this.url) {
                await this.loadDataGrid();
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
        ], this.id);
        this.forceManualUpdate()
    }
    get elementUrl() {
        return getElementUrl(ElementType.SchemaView, this.schemaId, this.syncBlockId);
    }
    /**
     * 获取自定义视图的卡片模板
     * @returns 
     */
    getCardUrl() {
        return undefined;
    }
    /**
     * 是否是定义视图模板
     */
    get isDefineViewTemplate() {
        var url = this.getCardUrl();
        if (url) return true;
        else return false;
    }
    isAllow(...ps: AtomPermission[]): boolean {
        if (this.page.pageLayout?.type == PageLayoutType.db) {
            return this.page.isAllow(...ps)
        }
        else {
            return this.schema?.isAllow(...ps)
        }
    }
    isCanEdit(): boolean {
        if (this.schema?.locker?.lock == true) return false;
        if (this.page.locker?.lock == true) return false;
        if (this.page.isSign == false) return false;
        return this.isAllow(
            AtomPermission.dbEdit,
            AtomPermission.pageFull,
            AtomPermission.pageEdit,
            AtomPermission.dbFull)
    }
    isCanLocker() {
        if (this.schema?.locker?.lock == true) return true;
        if (this.page.locker?.lock == true) return true;
        return false;
    }
    dataGridIsCanEdit() {
        return this.isCanEdit() && !this.isCanLocker()
    }
    isCanAddRow() {
        if (!this.page.isSign) return false;
        return this.isAllow(
            AtomPermission.dbAddRow,
            AtomPermission.pageFull,
            AtomPermission.pageEdit,
            AtomPermission.dbEdit,
            AtomPermission.dbEditRow,
            AtomPermission.dbFull
        )
    }
    isCanEditRow(row?) {
        if (!this.page.isSign) return false;
        if (this.isAllow(
            AtomPermission.dbEditRow,
            AtomPermission.pageFull,
            AtomPermission.pageEdit,
            AtomPermission.dbEdit,
            AtomPermission.dbFull
        )) return true;
        if (row && row.creater == this.page.user?.id && this.isAllow(AtomPermission.dbAddRow)) return true;
        return false
    }
    async getMd() {
        var ws = this.page.ws;
        return `[${this.schemaView?.text}](${ws.url + '/resource?elementUrl=' + window.encodeURIComponent(this.elementUrl)})`
    }
    onSyncAddRow = lodash.debounce(async (data, id?: string, arrow: 'before' | 'after' = 'after', force: boolean = true, action?: (newRow: Record<string, any>) => Promise<void>) => {
        var newRow = await this.onAddRow(data, id, arrow, force)
        if (action) await action(newRow)
    }, 50)
    onLazySearch = lodash.debounce(async () => {
        await this.onSearch()
    }, 700);
    async onContextmenu(event: Point | MouseEvent) {
        var rect = event instanceof Point ? new Rect(event.x, event.y, 0, 0) : Rect.fromEvent(event);
        await this.onOpenViewSettings(rect)
    }
    syncDataSchema = async (r: {
        operate: {
            operate?: string;
            schemaId: string;
            date?: Date;
            actions: any[];
        };
    }, options?: {
        locationId?: string | number;
        sockId?: string;
    }) => {
        console.log('syncDataSchema', r, options);
        if (this.dataGridIsCanEdit() == false) return;
        if (r?.operate?.schemaId) {
            // if (r?.operate.schemaId == this.schemaId) {
            if (options?.locationId == this.id) return;
            var act: SchemaAction = r.operate.actions[0];
            if (act) {
                if ([
                    'createSchemaView',
                    'removeSchemaView',
                    'updateSchemaView',
                    'updateSchema',
                    'duplicateSchemaView',
                    'changeSchemaView',
                    'moveSchemaView'
                ].includes(act.name)) {
                    if (r?.operate?.schemaId == this.schemaId) {
                        var tc = await TableSchema.loadTableSchema(this.schemaId, this.page.ws, true)
                        await this.schema.cacPermissions();
                        this.schema = tc;
                    }
                    else if (r?.operate?.schemaId && this.relationSchemas.some(s => s.id == r.operate.schemaId)) {
                        var tc = await TableSchema.loadTableSchema(r.operate.schemaId, this.page.ws, true)
                        await tc.cacPermissions();
                        this.relationSchemas = this.relationSchemas.map(s => s.id == r.operate.schemaId ? tc : s)
                    }
                }
                else if (['addField', 'updateField', 'turnField', 'removeField'].includes(act.name)) {
                    if (r?.operate?.schemaId == this.schemaId) {
                        var tc = await TableSchema.loadTableSchema(this.schemaId, this.page.ws, true)
                        await this.schema.cacPermissions();
                        this.schema = tc;
                    }
                    else if (r?.operate?.schemaId && this.relationSchemas.some(s => s.id == r.operate.schemaId)) {
                        var tc = await TableSchema.loadTableSchema(r.operate.schemaId, this.page.ws, true)
                        await tc.cacPermissions();
                        this.relationSchemas = this.relationSchemas.map(s => s.id == r.operate.schemaId ? tc : s)
                    }
                    if (act.name != 'addField') {
                        var isUpdate = this.fields.some(s => s.id == (act as any).id)
                        if (act.name == 'removeField') {
                            lodash.remove(this.fields, s => s.fieldId == (act as any).id);
                        }
                        if (isUpdate)
                            if (act.name == 'turnField') { this.onLazyReloadData(); }
                            else if (act.name == 'updateField') {
                                this.childs.forEach(row => {
                                    row.childs.forEach(c => {
                                        var f = c as OriginField;
                                        if (f.field?.id == (act as any).id) { f.forceManualUpdate() }
                                    })
                                })
                            }
                            else if (act.name == 'removeField') {
                                this.createRowsItem(true)
                            }
                    }
                }
                else if (['deleteSchema'].includes(act.name)) {

                }
                // switch (act.name) {
                //     case 'createSchemaView':
                //     case 'removeSchemaView':
                //     case 'updateSchemaView':
                //     case 'updateSchema':
                //     case 'duplicateSchemaView':
                //     case 'changeSchemaView':
                //     case 'moveSchemaView':
                //         // var tc = await TableSchema.loadTableSchema(this.schemaId, this.page.ws, true)
                //         // this.schema = tc;
                //         // await this.schema.cacPermissions();
                //         // if (act.name == 'removeSchemaView') {
                //         //     if (act.id == this.syncBlockId) {
                //         //         //ShyAlert('当前视图已被删除，将自动切换到默认视图')
                //         //         var view = this.schema.listViews.first();
                //         //         this.onDataGridTurnView(view.id)
                //         //     }
                //         // }
                //         break;
                //     case 'addField':
                //         // var tc = await TableSchema.loadTableSchema(this.schemaId, this.page.ws, true)
                //         // this.schema = tc;
                //         // await this.schema.cacPermissions();
                //         break;
                //     case 'updateField':
                //         // var tc = await TableSchema.loadTableSchema(this.schemaId, this.page.ws, true)
                //         // this.schema = tc;
                //         // await this.schema.cacPermissions();
                //         // if (this.fields.some(s => s.field?.id == (act as any).id)) {
                //         //     this.forceManualUpdate();
                //         // }
                //         break;
                //     case 'removeField':
                //         // var tc = await TableSchema.loadTableSchema(this.schemaId, this.page.ws, true)
                //         // this.schema = tc;
                //         // await this.schema.cacPermissions();
                //         // if (this.fields.some(s => s.fieldId == (act as any).id)) {
                //         //     lodash.remove(this.fields, s => s.fieldId == (act as any).id);
                //         //     this.forceManualUpdate();
                //         // }
                //         break;
                //     case 'turnField':
                //         // var tc = await TableSchema.loadTableSchema(this.schemaId, this.page.ws, true)
                //         // this.schema = tc;
                //         // await this.schema.cacPermissions();
                //         // if (this.fields.some(s => s.fieldId == (act as any).id)) {
                //         //     await this.onLazyReloadData();
                //         // }
                //         break;
                //     case 'deleteSchema':
                //         // this.schema = null;
                //         // await this.loadDataGrid();
                //         break;
                // }
            }
            // }
        }
    }
    syncDatastore = async (r: {
        operate: {
            operate?: string;
            schemaId: string;
            date?: Date;
            actions: any[];
        },
        result: {
            actions: any[];
        },
    }, options?: {
        locationId?: string | number;
        sockId?: string;
    }) => {
        console.log('syncDatastore', r, options);
        if (this.dataGridIsCanEdit() == false) return;
        if (r?.operate?.schemaId) {
            if (r?.operate.schemaId == this.schemaId) {
                if (options?.locationId == this.id) return;
                var act: DataStoreAction = r.operate.actions[0];
                var result = r.result.actions[0];
                if (act) {
                    switch (act.name) {
                        case 'add':
                            if (r?.operate.schemaId == this.schemaId) {
                                if (options?.locationId == 'Page.onSubmitForm' || options?.locationId == 'flowButtonAddRecords') {
                                    this.data.push(result.data);
                                    this.total += 1;
                                    await this.createOneItem(result.data, true)
                                    this.onNotifyPageReferenceBlocks();
                                }
                            }
                            else if (r?.operate.schemaId && this.relationDatas.has(r.operate.schemaId)) {
                                this.relationDatas.get(r.operate.schemaId).push(result.data);
                            }
                            break;
                        case 'batchAdd':
                            if (options.locationId == '') {

                            }
                        case 'update':
                            if (r?.operate.schemaId == this.schemaId) {
                                var dr = this.data.find(g => g.id == (act as any).id);
                                if (dr) {
                                    Object.assign(dr, (act as any).data);
                                    console.log('up....', dr);
                                    await this.createOneItem(dr, true)
                                }
                            }
                            else if (r?.operate.schemaId && this.relationDatas.has(r.operate.schemaId)) {
                                var drc = this.relationDatas.get(r.operate.schemaId).find(g => g.id == (act as any).id);
                                if (drc) {
                                    Object.assign(drc, (act as any).data);
                                }
                            }
                            break;
                        case 'remove':
                            if (r?.operate.schemaId == this.schemaId) {
                                var dr = this.data.find(g => g.id == (act as any).id);
                                if (dr) {
                                    lodash.remove(this.data, g => g.id == (act as any).id);
                                    this.total -= 1;
                                    this.onNotifyPageReferenceBlocks();
                                    await this.deleteOneItem(dr, true);
                                }
                            }
                            else if (r?.operate.schemaId && this.relationDatas.has(r.operate.schemaId)) {
                                var drc = this.relationDatas.get(r.operate.schemaId).find(g => g.id == (act as any).id);
                                if (drc) {
                                    lodash.remove(this.relationDatas.get(r.operate.schemaId), g => g.id == (act as any).id);
                                }
                            }
                            break;
                        case 'removeIds':
                            if (r?.operate.schemaId == this.schemaId) {
                                var drs = this.data.filter(g => (act as any).ids.includes(g.id));
                                if (drs.length > 0) {
                                    lodash.remove(this.data, g => (act as any).ids.includes(g.id));
                                    this.total -= (act as any).ids.length;
                                    this.onNotifyPageReferenceBlocks();
                                    await this.deleteOneItem(drs, true)
                                }
                            }
                            else if (r?.operate.schemaId && this.relationDatas.has(r.operate.schemaId)) {
                                var drcs = this.relationDatas.get(r.operate.schemaId).filter(g => (act as any).ids.includes(g.id));
                                if (drcs.length > 0) {
                                    lodash.remove(this.relationDatas.get(r.operate.schemaId), g => (act as any).ids.includes(g.id));
                                }
                            }
                            break;
                        case 'removeFilter':
                            this.onLazyReloadData();
                            break;
                        case 'updateFilter':
                            this.onLazyReloadData();
                            break;
                        case 'updateObject':
                            break;
                    }
                }
            }
        }
    }
    get dataGridTab() {
        if (this.parent?.url == BlockUrlConstant.DataGridTabPage) {
            return this.parent.parent as DataGridTab;
        }
    }
    /**
     * 当页面是数据表格时，数据表格下面不能插入其它块，
     * 所以+号图标不在显示
     * @returns 
     */
    isVisiblePlus() {
        if (this.page.pageLayout?.type == PageLayoutType.db) {
            return false;
        }
        else return super.isVisiblePlus();
    }
    get isCanDrag() {
        if (this.page.pageLayout?.type == PageLayoutType.db) {
            return false;
        }
        else return super.isCanDrag;
    }
    getVisibleHandleCursorPoint() {
        var r = super.getVisibleHandleCursorPoint();
        r = r.move(0, 3);
        return r;
    }
    onLazyReloadData = lodash.debounce(async (action?: () => Promise<void>) => {
        await this.onReloadData();
        if (action) await action();
    }, 1000)
    onLazy100ReloadData = lodash.debounce(async (action?: () => Promise<void>) => {
        await this.onReloadData();
        if (action) await action();
    }, 100)
    forceUpdateAllViews() {
        this.childs.forEach(c => {
            c.forceManualUpdate();
            c.childs.forEach(cc => {
                cc.forceManualUpdate();
            })
        })
    }
    subMapSpread: Map<string, boolean> = new Map();
    getRollupValue(row: Record<string, any>, field: Field) {
        var rf = this.schema.fields.find(g => g.id == field.config.rollupRelationFieldId);
        if (rf) {
            var sch = this.relationSchemas.find(g => g.id == rf.config.relationTableId);
            if (sch) {
                var rollField = sch.fields.find(g => g.id == field.config.rollupFieldId);
                if (rollField) {
                    var ids = row[rf.name];
                    if (!Array.isArray(ids)) ids = [];
                    if (ids.length > 0) {
                        var refRows = this.relationDatas.get(rf.config.relationTableId).findAll(g => ids.includes(g.id)).map(c => c[rollField.name]);
                        return refRows;
                    }
                }
            }
        }
        return []
    }
}

export interface DataGridView extends DataGridViewLife { }
export interface DataGridView extends DataGridViewOperator { }
export interface DataGridView extends DataGridViewData { }
export interface DataGridView extends DataGridViewConfig { }
export interface DataGridView extends DataGridViewField { }
Mix(DataGridView, DataGridViewLife, DataGridViewOperator, DataGridViewData, DataGridViewConfig, DataGridViewField)