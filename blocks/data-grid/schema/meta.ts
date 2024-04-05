import lodash from "lodash";
import { MergeSock } from "../../../component/lib/merge.sock";
import { CoverMask, IconArguments } from "../../../extensions/icon/declare";
import { channel } from "../../../net/channel";
import { BlockUrlConstant } from "../../../src/block/constant";
import { Field } from "./field";
import { DisabledFormFieldTypes, DisabledSortFieldTypes, FieldType, IsArrayValueFieldTypes, SysFieldTypes, SysHiddenFieldTypes } from "./type";
import { ViewField } from "./view";
import { AtomPermission } from "../../../src/page/permission";
import { Page } from "../../../src/page";
import { LinkWs } from "../../../src/page/declare";
import { CardFactory } from "../template/card/factory/factory";
import { lst } from "../../../i18n/store";


export interface TableSchemaView {
    id: string,
    text: string,
    icon: IconArguments,
    cover?: { abled: boolean, url: string, thumb: string, top: number },
    description: string,
    url: string,

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
    /**
     * 外部邀请的用户权限
     */
    inviteUsersPermissions: { userid: string, permissions: AtomPermission[] }[];
    /**
     * 空间成员权限，
     * 可以指定角色，也可以指定具体的人
     */
    memberPermissions: { roleId: string, userid: string, permissions: AtomPermission[] }[];

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
    id: string
    url: string;
    text: string;
    creater: string;
    createDate: Date;
    fields: Field[] = [];
    icon: IconArguments;
    cover: CoverMask;
    locker: {
        lock: boolean,
        date: number,
        userid: string
    }
    /**
     * 可以被用户感知显示的字段
     * 用户可以选择显示的字段
     */
    get visibleFields(): Field[] {
        var fs = this.fields.findAll(g => g.text && !SysHiddenFieldTypes.includes(g.type));
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
        var fs= this.fields.findAll(g => g.text && (g.type == FieldType.title || !SysFieldTypes.includes(g.type)))
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
        var fs = this.fields.findAll(x => x.text && !DisabledSortFieldTypes.includes(x.type) ? true : false)
        var ns = fs.findAll(g => !SysFieldTypes.includes(g.type));
        fs = fs.findAll(g => SysFieldTypes.includes(g.type));
        fs.sort((x, y) => {
            if (x.type === FieldType.title) return -1;
            else return 1;
        })
        fs.splice(1, 0, ...ns);
        return fs;
    }
    get allowFormFields() {
        var fs = this.fields.findAll(g => !DisabledFormFieldTypes.includes(g.type))
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
    rowAdd(args: { data: Record<string, any>, pos?: { id: string, pos: 'before' | 'after' } }) {
        return channel.put('/datastore/add', Object.assign({ schemaId: this.id }, args));
    }
    rowUpdateAll(args: { data: Record<string, any>, filter: Record<string, any> }, ws: LinkWs) {
        return channel.patch('/datastore/row/update', { schemaId: this.id, ...args, ws })
    }
    rowRank(args: { id: string, pos: { id: string, pos: 'before' | 'after' } }) {
        return channel.put('/datastore/rank', Object.assign({ schemaId: this.id }, args));
    }
    rowRemove(id: string) {
        return channel.del('/datastore/remove', Object.assign({ schemaId: this.id }, { dataId: id }));
    }
    rowRemoves(ids: string[]) {
        return channel.del('/datastore/remove/ids', Object.assign({ schemaId: this.id }, { ids }));
    }
    rowRemovesByFilter(filter: Record<string, any>) {
        return channel.del('/datastore/remove/filter', Object.assign({ schemaId: this.id }, { filter }));
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
    rowUpdate(args: { dataId: string, data: Record<string, any> }) {
        return channel.patch('/datastore/update', Object.assign({ schemaId: this.id }, args));
    }
    async checkSubmit(page: Page) {
        return channel.get('/datastore/exists/user/submit', { schemaId: this.id, ws: page.ws });
    }
    rowUpdateFieldObject(args: { rowId: string, fieldName: string, data: Record<string, any> }) {
        return channel.put('/datastore/row/object/update', Object.assign({ schemaId: this.id }, args));
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
    fieldAdd(field: { text: string, type: FieldType, config?: Record<string, any> }) {
        return this.onSchemaOperate([{ name: 'addField', field }])
    }
    fieldRemove(fieldId: string) {
        return this.onSchemaOperate([{ name: 'removeField', fieldId }])
    }
    fieldUpdate(args: { fieldId: string, data: Record<string, any> }) {
        return this.onSchemaOperate([{
            name: 'updateField',
            fieldId: args.fieldId,
            data: args.data
        }])
    }
    turnField(args: { fieldId: string, text: string, type: FieldType, config?: Record<string, any> }) {
        return channel.put('/schema/operate', {
            operate: {
                schemaId: this.id,
                date: new Date(),
                actions: [{ name: 'turnField', ...args }]
            }
        })
    }
    async update(props: Record<string, any>) {
        return await this.onSchemaOperate([{
            name: 'updateSchema',
            data: props
        }])
    }
    /*
     * 
     * { name: 'createSchemaView', text: r.text, url: r.url }
     * { name: 'addField', field: { text: '状态', type: FieldType.option } }
     * { name: 'updateField',fieldId:string, data: Record<string, any>}
     * { name: 'removeSchemaView', id: view.id }
     * { name: 'duplicateSchemaView',id:view.id,data:{snap:any}}
     * { name: 'updateSchemaView', id: view.id, data: { text: it.value } }
     * { name: 'changeSchemaView',id:view.id,data:{url:string}}
     * { name: 'updateSchema', data: { text: it.value } }
     * { name: 'moveSchemaView',id:view.id,data:{from:number,to:number}}
     * { name:'removeField',fieldId:string }
     */
    async onSchemaOperate(actions: {
        name: 'createSchemaView' | 'addField' | 'updateField' | 'removeSchemaView' | 'duplicateSchemaView' | 'updateSchemaView' | 'changeSchemaView' | 'updateSchema' | 'moveSchemaView' | 'removeField',
        text?: string,
        url?: string,
        field?: Record<string, any>,
        id?: string,
        data?: Record<string, any>,
        fieldId?: string
    }[]) {
        var result = await channel.put('/schema/operate', {
            operate: {
                schemaId: this.id,
                date: new Date(),
                actions
            }
        });
        actions.forEach((action, i) => {
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
            }
        })
        return result;
    }
    async createSchemaView(text: string, url: string) {
        var cm = CardFactory.CardModels.get(url)?.model;
        var viewUrl = url;
        var viewProps: Record<string, any>;
        if (cm) {
            viewUrl = cm.forUrls[0];
            var ps = cm.props.toArray(pro => {
                var f = this.fields.find(x => x.text == pro.text && x.type == pro.types[0]);
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
        var actions: any[] = [{ name: 'createSchemaView', text: text, url: url }];
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
        var result = await this.onSchemaOperate(actions)
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
    static schemas: Map<string, TableSchema> = new Map();
    static isLoadAll: boolean = false;
    static async loadTableSchema(schemaId: string, ws: LinkWs): Promise<TableSchema> {
        var schema = this.schemas.get(schemaId);
        if (schema) return schema;
        else {
            return await this.batchSchema.get<TableSchema>(schemaId, [ws])
        }
    }
    static async cacheSchema(schema: Partial<TableSchema>) {
        if (!(schema instanceof TableSchema)) {
            schema = new TableSchema(schema);
        }
        this.schemas.set(schema.id, schema as TableSchema);
        return schema;
    }
    static async getSchemas() {
        return Array.from(this.schemas.values());
    }
    static async loadListSchema(schemaIds: string[], page: Page) {
        var rs: TableSchema[] = [];
        for (let i = schemaIds.length - 1; i >= 0; i--) {
            var r = this.schemas.get(schemaIds[i]);
            if (r) {
                rs.push(r);
                schemaIds.splice(i, 1);
            }
        }
        if (schemaIds.length > 0) {
            var gs = await channel.get('/schema/ids/list', { ids: schemaIds, ws: page.ws });
            if (gs.ok) {
                rs.push(...gs.data.list.map(r => new TableSchema(r)));
                rs.each(r => {
                    this.schemas.set(r.id, r);
                })
            }
        }
        return rs;
    }
    static async onCreate(data: { text: string, url: string }) {
        var r = await channel.put('/schema/create', { text: data.text, url: data.url });
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
                this.schemas.set(g.id, schema);
            })
        }
    }
    static async deleteTableSchema(schemaId: string) {
        await channel.del('/schema/delete', { id: schemaId });
        this.schemas.delete(schemaId);
    }
    static async getTableSchema(schemaId: string) {
        return this.schemas.get(schemaId)
    }
    static batchSchema = new MergeSock(async (batchs) => {
        var gs = await channel.get('/schema/ids/list', { ws: batchs[0]?.args[0], ids: lodash.uniq(batchs.map(b => b.id)) });
        if (gs.ok) {
            var rs: TableSchema[] = [];
            rs.push(...gs.data.list.map(r => new TableSchema(r)));
            rs.each(r => {
                TableSchema.schemas.set(r.id, r);
            })
            return rs.map(r => { return { id: r.id, data: r } })
        }
        else return []
    })
    static fieldIsDate(field: Field) {
        return [FieldType.date, FieldType.modifyDate, FieldType.createDate].includes(field.type);
    }
    static fieldValueIsArray(field: Field) {
        return IsArrayValueFieldTypes.includes(field.type)
    }
    static isSystemField(field: Field) {
        return SysFieldTypes.includes(field.type)
    }
}


