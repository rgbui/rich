import lodash from "lodash";
import { MergeSock } from "../../../component/lib/merge.sock";
import { CoverMask, IconArguments } from "../../../extensions/icon/declare";
import { channel } from "../../../net/channel";
import { BlockUrlConstant } from "../../../src/block/constant";
import { Field } from "./field";
import { DisabledFormFieldTypes, DisabledSortFieldTypes, FieldType, IsArrayValueFieldTypes, OnlyFieldTypes, SysFieldTypes, SysHiddenFieldTypes } from "./type";
import { ViewField } from "./view";
import { AtomPermission, PageSourcePermission } from "../../../src/page/permission";
import { Page } from "../../../src/page";
import { LinkWs } from "../../../src/page/declare";
import { CardFactory } from "../template/card/factory/factory";
import { lst } from "../../../i18n/store";
import { PageLocation } from "../../../src/page/directive";
import { GroupIdType } from "../view/declare";
import { ElementType, getElementUrl } from "../../../net/element.type";


export type DataStoreAction = {
    name: 'add',
    data?: Record<string, any>,
    pos?: { id: string, pos: 'before' | 'after' },
} | {
    name: 'rank',
    id: string,
    data?: Record<string, any>,
    pos?: { id: string, pos: 'before' | 'after' },
} | {
    name: 'batchAdd',
    list: Record<string, any>[]
} | {
    name: 'remove',
    id: string
} | {
    name: 'removeIds',
    ids: string[]
} | {
    name: 'removeFilter',
    filter: Record<string, any>
} | {
    name: 'update',
    id: string,
    data: Record<string, any>
} | {
    name: 'updateFilter',
    filter: Record<string, any>,
    data: Record<string, any>,
    directFilter?: boolean
} | {
    name: 'updateObject',
    id: string,
    fieldName: string,
    data: Record<string, any>
} | {
    name: 'updateDoubleRelation',
    fieldName: string,
    isMultiple?: boolean,
    data: { id: string, count: number, refId: string }[]
}

export type SchemaAction = { name: 'createSchemaView', text: string, url: string, data?: Record<string, any> }
    | { name: 'addField', field: { text: string, type: FieldType, config?: Record<string, any> } }
    | { name: 'updateField', fieldId: string, data: Record<string, any> }
    | { name: 'removeSchemaView', id: string }
    | { name: 'duplicateSchemaView', id: string, data?: { snap: any } }
    | { name: 'updateSchemaView', id: string, data: Record<string, any> }
    | { name: 'changeSchemaView', id: string, data: { url: string } }
    | { name: 'updateSchema', id: string, data: Record<string, any> }
    | { name: 'deleteSchema', id: string }
    | { name: 'moveSchemaView', id: string, data: { from: number, to: number } }
    | { name: 'removeField', fieldId: string }
    | {
        name: 'turnField',
        fieldId: string,
        data: Record<string, any>
    }

export interface TableSchemaView {
    id: string,
    text: string,
    icon: IconArguments,
    cover?: { abled: boolean, url: string, thumb: string, top: number },
    description: { abled: boolean, text: string },
    url: string,


    formType: 'doc' | 'doc-add' | 'doc-detail';


    /**
     * 以下属性只有表单、清单的时候才起作用
     * 正常的表格视图受页面的权限影响，表单是单独的页面
     */

    /**
     * 是否允许用户添加多份
     */
    disabledUserMultiple?: boolean,
    /**
     * 是否允许匿名提交
     */
    allowAnonymous?: boolean,
    /**
     * 是否为公开
     * net 互联网公开
     * nas 网络存储
     * local 本地存储
    */
    share: 'net' | 'nas' | 'local';
    /**
     * 互联网是否公开，如果公开的权限是什么
     */
    netPermissions: AtomPermission[];
    netCopy?: boolean;
    /**
     * 外部邀请的用户权限
     */
    inviteUsersPermissions: { userid: string, permissions: AtomPermission[] }[];
    /**
     * 空间成员权限，
     * 可以指定角色，也可以指定具体的人
     */
    memberPermissions: { roleId: string, permissions: AtomPermission[] }[];

}

/**
 * 
 * schema  table fields meta
 * syncBlockId ViewFields （控制展示的数据结构信息）
 * block fields(控制列宽)
 * 
 * show view(schema->syncBlock->block-business model)
 * 
 */
export class TableSchema {
    private constructor(data) {
        this.loadDate = new Date();
        for (var n in data) {
            if (n == 'fields') continue;
            if (['recordViews', 'listViews', 'visibleFields', 'recordViewTemplateFields'].includes(n)) continue;
            this[n] = data[n];
        }
        if (Array.isArray(data.fields))
            data.fields.each(col => {
                var field = new Field();
                field.load(col);
                this.fields.push(field);
            })
    }
    loadDate: Date;
    id: string
    url: string;
    text: string;
    creater: string;
    createDate: Date;
    fields: Field[] = [];
    allowSubs: boolean = false;
    icon: IconArguments;
    cover: CoverMask;
    workspaceId: string;
    locker: {
        lock: boolean,
        date: number,
        userid: string
    }
    get ElementUrl() {
        return getElementUrl(ElementType.Schema, this.id);
    }
    sourcePermission: PageSourcePermission;
    /**
   * 是否为公开
   * net 互联网公开
   * nas 网络存储
   * local 本地存储
  */
    share: 'net' | 'nas' | 'local';

    /**
     * 互联网是否公开，如果公开的权限是什么
     */
    netPermissions: AtomPermission[];
    /**
     * 外部邀请的用户权限
     */
    inviteUsersPermissions: { userid: string, permissions: AtomPermission[] }[];
    /**
     * 空间成员权限，
     * 可以指定角色，也可以指定具体的人
     */
    memberPermissions: { roleId: string, permissions: AtomPermission[] }[];
    /**
     * 可以被用户感知显示的字段
     * 用户可以选择显示的字段
     */
    get visibleFields(): Field[] {
        var fs = this.fields.findAll(g => g.visible !== false && g.text && !SysHiddenFieldTypes.includes(g.type));
        var ns = fs.findAll(g => !SysFieldTypes.includes(g.type));
        fs = fs.findAll(g => SysFieldTypes.includes(g.type));
        fs.sort((x, y) => {
            if (x.type === FieldType.title) return -1;
            else return 1;
        })
        fs.splice(1, 0, ...ns);
        return fs;
    }
    get allVisibleFields() {
        var fs = this.fields.findAll(g => g.visible !== false && g.text && ![FieldType.deleted].includes(g.type));
        var ns = fs.findAll(g => !SysFieldTypes.includes(g.type));
        fs = fs.findAll(g => SysFieldTypes.includes(g.type));
        fs.sort((x, y) => {
            if (x.type === FieldType.title) return -1;
            else return 1;
        })
        fs.splice(1, 0, ...ns);
        return fs;
    }
    /**
     * 系统创建表格时，默认创建显示的字段
     */
    get defaultViewFields() {
        var fs = this.fields.findAll(g => g.visible !== false && g.text && (g.type == FieldType.title || !SysFieldTypes.includes(g.type)))
        var ns = fs.findAll(g => !SysFieldTypes.includes(g.type));
        fs = fs.findAll(g => SysFieldTypes.includes(g.type));
        fs.sort((x, y) => {
            if (x.type === FieldType.title) return -1;
            else return 1;
        })
        fs.splice(1, 0, ...ns);
        return fs;
    }
    get allowSortFields() {
        var fs = this.fields.findAll(x => x.visible !== false && x.text && !DisabledSortFieldTypes.includes(x.type) ? true : false)
        var ns = fs.findAll(g => !SysFieldTypes.includes(g.type));
        fs = fs.findAll(g => SysFieldTypes.includes(g.type));
        fs.sort((x, y) => {
            if (x.type === FieldType.title) return -1;
            else return 1;
        })
        fs.splice(1, 0, ...ns);
        return fs;
    }
    getFormFields(isTemplate: boolean, formType: "doc" | "doc-add" | "doc-detail") {
        var fs = this.fields.findAll(g => g.visible !== false && !DisabledFormFieldTypes.includes(g.type))
        fs.sort((x, y) => {
            if (x.type === FieldType.title) return -1;
            else return 1;
        })
        if (formType == 'doc-add' || formType == 'doc') {
            lodash.remove(fs, g => [
                FieldType.formula,
                FieldType.rollup,
                FieldType.modifyDate,
                FieldType.modifyer,
                FieldType.createDate,
                FieldType.creater,
                FieldType.emoji,
                FieldType.like,
                FieldType.love,
                FieldType.vote
            ].includes(g.type))
        }
        if (formType == 'doc-add') {
            lodash.remove(fs, g => [].includes(g.type))
        }
        if (formType == 'doc') {
            lodash.remove(fs, g => [FieldType.title].includes(g.type))
        }
        if (formType == 'doc-detail') {
            lodash.remove(fs, g => [FieldType.rollup, FieldType.title].includes(g.type))
        }
        return fs;
    }
    get allowFormFields() {
        var fs = this.fields.findAll(g => g.visible !== false && !DisabledFormFieldTypes.includes(g.type))
        var ns = fs.findAll(g => !SysFieldTypes.includes(g.type));
        fs = fs.findAll(g => SysFieldTypes.includes(g.type));
        fs.sort((x, y) => {
            if (x.type === FieldType.title) return -1;
            else return 1;
        })
        fs.splice(1, 0, ...ns);
        return fs;
    }
    isType(fieldId: string, ...types: FieldType[]) {
        var f = this.fields.find(c => c.id == fieldId);
        if (f) {
            return types.includes(f.type)
        }
        return false;
    }
    async cacPermissions(force?: boolean) {
        if (force == true || !this.sourcePermission)
            this.sourcePermission = await channel.get('/page/allow', { elementUrl: this.ElementUrl })
    }
    isAllow(...ps: AtomPermission[]): boolean {
        if (!this.sourcePermission) {
            //  console.log('schema sourcePermission is null')
        }
        if (!this.sourcePermission) return false;
        return this.sourcePermission.permissions.some(p => ps.includes(p))
    }
    views: TableSchemaView[] = [];
    get recordViews() {
        return this.views.findAll(g => [BlockUrlConstant.RecordPageView].includes(g.url as any))
    }
    get listViews() {
        return this.views.findAll(g => ![BlockUrlConstant.RecordPageView].includes(g.url as any))
    }
    defaultCollectFormId: string = '';
    get defaultAddForm() {
        var rv = this.defaultCollectFormId ? this.views.find(g => g.id == this.defaultCollectFormId) : this.views.find(g => g.url == BlockUrlConstant.RecordPageView)
        if (!rv) rv = this.views.find(g => g.url == BlockUrlConstant.RecordPageView)
        return rv;
    }
    getViewFields() {
        var fs = this.defaultViewFields;
        fs.sort((x, y) => {
            if (x.type === FieldType.title) return -1;
            else return 1;
        })
        return fs.map(f => {
            return this.createViewField(f);
        })
    }
    createViewField(field: Field) {
        return new ViewField({
            fieldId: field.id,
            text: field.text
        }, this);
    }
    rowAdd(args: { data: Record<string, any>, pos?: { id: string, pos: 'before' | 'after' } }, locationId: string) {
        return this.onDataStoreOperate([{ name: 'add', data: args.data, pos: args.pos }], locationId)
    }
    rowUpdateAll(args: { data: Record<string, any>, filter: Record<string, any> }, locationId: string) {
        return this.onDataStoreOperate([{ name: 'updateFilter', filter: args.filter, data: args.data }], locationId)
    }
    rowRank(args: { id: string, data?: Record<string, any>, pos: { id: string, pos: 'before' | 'after' } }, locationId: string) {
        return this.onDataStoreOperate([{ name: 'rank', data: args.data, id: args.id, pos: args.pos }], locationId)
    }
    rowRemove(id: string, locationId: string) {
        return this.onDataStoreOperate([{ name: 'remove', id }], locationId)
    }
    rowRemoves(ids: string[], locationId: string) {
        return this.onDataStoreOperate([{ name: 'removeIds', ids }], locationId)
    }
    rowRemovesByFilter(filter: Record<string, any>, locationId: string) {
        return this.onDataStoreOperate([{ name: 'removeFilter', filter }], locationId)
    }
    rowUpdate(args: { dataId: string, data: Record<string, any> }, locationId: string) {
        return this.onDataStoreOperate([{ name: "update", id: args.dataId, data: lodash.cloneDeep(args.data) }], locationId)
    }
    rowUpdateFieldObject(args: { rowId: string, fieldName: string, data: Record<string, any> }, locationId: string) {
        return this.onDataStoreOperate([{ name: 'updateObject', id: args.rowId, fieldName: args.fieldName, data: lodash.cloneDeep(args.data) }], locationId)
    }
    async onDataStoreOperate(actions: DataStoreAction[], locationId: string) {
        var rc = await channel.air('/datastore/operate', {
            operate: {
                actions,
                schemaId: this.id,
                date: new Date(),
                operate: 'onDataStoreOperate'
            }
        }, { locationId: locationId });
        return rc.data.actions[0]
    }
    async rowGetPrevAndNext(id: string, ws: LinkWs) {
        return await channel.get('/datastore/query/pre_next', { ws, schemaId: this.id, id })
    }
    async rowGet(id: string) {
        return await this.batchRowGet.get<Record<string, any>>(id, [this.id])
    }
    batchRowGet = new MergeSock(async (batchs) => {
        var gs = await channel.get('/datastore/query/ids' as any, { schemaId: batchs[0].args[0], ids: lodash.uniq(batchs.map(b => b.id)) });
        if (gs.ok) {
            var rs = gs.data.list;
            return rs.map(r => { return { id: r.id, data: r } })
        }
        else return []
    })
    async checkSubmit(page: Page) {
        return channel.get('/datastore/exists/user/submit', { schemaId: this.id, ws: page.ws });
    }
    list(options: {
        page: number,
        size?: number,
        filter?: Record<string, any>,
        directFilter?: Record<string, any>,
        sorts?: Record<string, -1 | 1>,
        projects?: string[];
        isIgnoreCount?: boolean;
    }, ws: LinkWs) {
        return channel.get('/datastore/query/list', Object.assign({ schemaId: this.id, ws: ws }, options));
    }
    all(options: {
        page: number,
        size?: number,
        filter?: Record<string, any>,
        sorts?: Record<string, -1 | 1>
    }, ws: LinkWs) {
        return channel.get('/datastore/query/all', Object.assign({ schemaId: this.id, ws: ws }, options));
    }
    group(
        options: {
            filter?: Record<string, any>,
            size?: number,
            sorts?: Record<string, 1 | -1>,
            group: string
        }, ws: LinkWs) {
        return channel.get('/datastore/group', Object.assign({ schemaId: this.id, ws: ws }, options));
    }
    gridList(options: {
        page: number,
        size?: number,
        filter?: Record<string, any>,
        directFilter?: Record<string, any>,
        sorts?: Record<string, -1 | 1>,
        projects?: string[];
        isIgnoreCount?: boolean;
        groupView?: any,
    }, ws: LinkWs) {
        return channel.get('/datastore/dataGrid/list', Object.assign({ schemaId: this.id, ws: ws }, options));
    }
    gridSubList(options: {
        parentId: string,
        page: number,
        size?: number,
        filter?: Record<string, any>,
        groupFilter?: Record<string, any>,
        sorts?: Record<string, -1 | 1>,
        projects?: string[];

    }, ws: LinkWs) {
        return channel.get('/datastore/dataGrid/sub/list', Object.assign({ schemaId: this.id, ws: ws }, options));
    }
    boardGroup(options: {
        filter?: Record<string, any>,
        page?: number,
        size?: number,
        sorts?: Record<string, 1 | -1>,
        group: string,
        hideGroups?: string[],
        isIgnoreEmpty?: boolean,
        isStatTotal?: boolean,
        groupView?: any,
    }, ws: LinkWs) {
        return channel.get('/datastore/board/statistics', Object.assign({ schemaId: this.id, ws: ws }, options));
    }
    boardFieldStat(
        options: {
            filter?: Record<string, any>,
            group: string,
            hideGroups?: string[],
            isIgnoreEmpty?: boolean, stat: { fieldId: string, stat: string }
        }, ws: LinkWs) {
        return channel.get('/datastore/board/stat/fields', Object.assign({ schemaId: this.id, ws: ws }, options))
    }
    statFields(options: {
        groupFilters?: {
            id: GroupIdType;
            filter: Record<string, any>;
        }[],
        stats: { fieldId: string, stat: string }[], filter?: Record<string, any>
    }, ws: LinkWs) {
        return channel.get('/datastore/stat/fields', Object.assign({ schemaId: this.id, ws: ws }, options as any));
    }
    statistics(options: {
        page?: number,
        size?: number,
        filter?: Record<string, any>,
        having?: Record<string, any>,
        sorts?: Record<string, 1 | -1>,
        groups: string[],
        aggregate?: Record<string, any>
    }, ws: LinkWs) {
        return channel.get('/datastore/statistics', Object.assign({ schemaId: this.id, ws: ws }, options));
    }
    statisticValue(options: { filter?: Record<string, any>, fieldName?: string, indicator: string; }, ws: LinkWs) {
        return channel.get('/datastore/statistics/value', Object.assign({ schemaId: this.id, ws: ws }, options));
    }
    distinct(options: { filter?: Record<string, any>, field: string }, ws: LinkWs) {
        return channel.get('/datastore/query/distinct', Object.assign({ schemaId: this.id, ws: ws }, options))
    }
    fieldAdd(field: { text: string, type: FieldType, config?: Record<string, any> }, locationId: string | PageLocation) {
        return this.onSchemaOperate([{ name: 'addField', field: field as any }], locationId)
    }
    fieldRemove(fieldId: string, locationId: string) {
        return this.onSchemaOperate([{ name: 'removeField', fieldId }], locationId)
    }
    fieldUpdate(args: { fieldId: string, data: Record<string, any> }, locationId: string | PageLocation) {
        return this.onSchemaOperate([{
            name: 'updateField',
            fieldId: args.fieldId,
            data: args.data
        }], locationId)
    }
    turnField(args: { fieldId: string, data: { text: string, type: FieldType, config?: Record<string, any> } }, locationId: string | PageLocation) {
        return this.onSchemaOperate([{
            name: 'turnField',
            fieldId: args.fieldId,
            data: args.data
        }], locationId)
    }
    async update(props: Record<string, any>, locationId: string | PageLocation) {
        return await this.onSchemaOperate([{
            name: 'updateSchema',
            id: this.id,
            data: props
        }], locationId)
    }
    async onSchemaOperate(actions: SchemaAction[], locationId: string | PageLocation) {
        var result = await channel.air('/schema/operate', {
            operate: {
                schemaId: this.id,
                date: new Date(),
                actions
            }
        }, { locationId: locationId || PageLocation.schemaOperate });
        for (let i = 0; i < actions.length; i++) {
            var action = actions[i] as any;
            var re = result.data.actions[i];
            switch (action.name) {
                case 'createSchemaView':
                    this.views.push(re);
                    break;
                case 'removeSchemaView':
                    // case 'removeSchemaRecordView':
                    this.views.remove(g => g.id == action.id);
                    // break;
                    // this.recordViews.remove(g => g.id == action.id);
                    break;
                case 'updateSchemaView':
                    // case 'updateSchemaRecordView':
                    var view = this.views.find(g => g.id == action.id);
                    if (view) {
                        Object.assign(view, action.data);

                    }
                    break;
                case 'changeSchemaView':
                    var view = this.views.find(g => g.id == action.id);
                    if (view) {
                        Object.assign(view, action.data);
                    }
                    break;
                case 'updateSchema':
                    Object.assign(this, action.data);
                    break;
                case 'duplicateSchemaView':
                    this.views.push(re);
                    break;
                case 'moveSchemaView':
                    var view = this.views.find(g => g.id == action.id);
                    this.views.remove(g => g === view);
                    this.views.splice(action.data.to as number, 0, view);
                    break;
                case 'addField':
                    var field = new Field();
                    field.load(Object.assign({}, re));
                    this.fields.push(field);
                    break;
                case 'updateField':
                    var f = this.fields.find(c => c.id == action.fieldId);
                    if (f) {
                        Object.assign(f, action.data)
                    }
                    break;
                case 'removeField':
                    this.fields.remove(c => c.id == action.fieldId)
                    break;
                case 'turnField':
                    var f = this.fields.find(c => c.id == action.fieldId);
                    if (f) {
                        f.type = action.data.type;
                        f.text = action.data.text;
                        f.config = action.data.config;
                        // f.config = Object.assign(f.config || {}, action.data.config || {})
                    }
                    // field.type = type;
                    // if (options.text) field.text = options.text;
                    // if (options.config) Object.assign(field.config, options.config);
                    break;
            }
        }
        return result;
    }
    async createSchemaView(text: string, url: string, locationId: string | PageLocation) {
        var cm = CardFactory.CardModels.get(url)?.model;
        var viewUrl = url;
        var viewProps: Record<string, any>;
        if (cm) {
            viewUrl = cm.forUrls[0];
            var ps = cm.props.toArray(pro => {
                var f = this.fields.find(x => x.text == pro.text && x.type == pro.types[0]);
                if (!f && pro.required) f = this.fields.find(g => pro.types.includes(g.type));
                if (f) {
                    return {
                        name: pro.name,
                        visible: true,
                        bindFieldId: f.id
                    }
                }
            })
            viewProps = ({
                openRecordSource: 'page',
                cardConfig: {
                    auto: false,
                    showCover: false,
                    coverFieldId: "",
                    coverAuto: false,
                    showMode: 'define',
                    templateProps: {
                        url: url,
                        props: ps
                    }
                }
            });
        }
        var actions: any[] = [{ name: 'createSchemaView', text: text, url: viewUrl }];
        if (url == '/data-grid/board' && !this.fields.some(f => f.type == FieldType.option || f.type == FieldType.options)) {
            actions.push({
                name: 'addField',
                field: {
                    text: lst('状态'),
                    type: FieldType.option,
                    config: {
                        options: []
                    }
                }
            })
        }
        var result = await this.onSchemaOperate(actions, locationId)
        var oneAction = result.data.actions.first();
        if (result.data.actions.length > 1) {
            var action = result.data.actions[1];
            var f = new Field();
            f.load({
                id: action.id,
                name: action.name,
                text: lst('状态'),
                type: FieldType.option,
                config: {
                    options: []
                }
            });
            this.fields.push(f);
        }
        return {
            props: viewProps,
            view: this.views.find(c => c.id == oneAction.id)
        }
    }
    private static schemas: Map<string, TableSchema> = new Map();
    static isLoadAll: boolean = false;
    static async loadTableSchema(schemaId: string, ws: LinkWs, options?: { force?: boolean }): Promise<TableSchema> {
        var schema = this.schemas.get(schemaId);
        if (!schema || options?.force == true) {
            return await this.batchSchema.get<TableSchema>(schemaId, [ws])
        }
        return schema;
    }
    static async cacheSchema(schema: Partial<TableSchema>) {
        if (!(schema instanceof TableSchema)) {
            schema = new TableSchema(schema);
        }
        this.schemas.set(schema.id, schema as TableSchema);
        return schema as TableSchema;
    }
    static getSchemas(wsId: string) {
        var schList = Array.from(this.schemas.values()).filter(g => g.workspaceId == wsId)
        schList = lodash.sortBy(schList, g => g.createDate)
        return schList;
    }
    static async loadListSchema(schemaIds: string[], page: Page) {
        schemaIds = lodash.cloneDeep(schemaIds);
        for (let i = schemaIds.length - 1; i >= 0; i--) {
            var r = this.schemas.get(schemaIds[i]);
            if (r) {
                schemaIds.splice(i, 1);
            }
        }
        if (schemaIds.length > 0) {
            await this.batchSchema.get<TableSchema>(schemaIds, [page.ws])
        }

    }
    static async onCreate(data: { text: string, url: string, id?: string }) {
        var r = await channel.put('/schema/create', { id: data.id, text: data.text, url: data.url });
        if (r.ok) {
            var schemaData = r.data.schema;
            var schema = new TableSchema(schemaData);
            this.schemas.set(schema.id, schema);
            return schema;
        }
    }
    static async onLoadAll() {
        if (this.isLoadAll) return;
        var r = await channel.get('/schema/list');
        if (r.ok) {
            r.data.list.forEach(g => {
                var schema = new TableSchema(g);
                var os = this.schemas.get(schema.id);
                if (os?.sourcePermission) schema.sourcePermission = os.sourcePermission
                this.schemas.set(g.id, schema);
            })
        }
    }
    static async deleteTableSchema(schemaId: string) {
        await channel.del('/schema/delete', { id: schemaId });
        var result = await channel.air('/schema/operate', {
            operate: {
                schemaId: schemaId,
                date: new Date(),
                actions: [{ name: 'deleteSchema', id: schemaId }]
            }
        }, { locationId: 'deleteTableSchema' });
        this.schemas.delete(schemaId);
    }
    static getTableSchema(schemaId: string) {
        return this.schemas.get(schemaId)
    }
    static batchSchema = new MergeSock(async (batchs) => {
        var ids = [];
        batchs.forEach(b => {
            if (Array.isArray(b.id)) {
                ids.push(...b.id)
            }
            else if (typeof b.id == 'string')
                ids.push(b.id)
        })
        ids = lodash.uniq(ids);
        var gs = await channel.get('/schema/ids/list', { ws: batchs[0]?.args[0], ids: ids });
        if (gs.ok) {
            var rs: TableSchema[] = [];
            rs.push(...gs.data.list.map(r => new TableSchema(r)));
            rs.each(r => {
                var os = this.schemas.get(r.id);
                if (os?.sourcePermission) r.sourcePermission = os.sourcePermission
                TableSchema.schemas.set(r.id, r);
            })
            return rs.map(r => { return { id: r.id, data: r } })
        }
        else return []
    })
    static fieldIsDate(field: Field) {
        if (!field) return false;
        return [FieldType.date, FieldType.modifyDate, FieldType.createDate].includes(field.type);
    }
    static fieldIsNumber(field: Field) {
        if (!field) return false;
        return [
            FieldType.sort,
            FieldType.number,
            FieldType.price,
            FieldType.autoIncrement
        ].includes(field.type)
    }
    static fieldValueIsArray(field: Field) {
        return IsArrayValueFieldTypes.includes(field.type)
    }
    static isSystemField(field: Field) {
        return SysFieldTypes.includes(field.type)
    }
    static isOnlyFieldTypes(field: Field) {
        return OnlyFieldTypes.includes(field.type)
    }

}


