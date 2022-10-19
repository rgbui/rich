import { channel } from "../../../net/channel";
import { Field } from "./field";
import { FieldType } from "./type";
import { ViewField } from "./view";

/**
 * 
 * schema  table fields meta
 * syncBlockId ViewFields （控制展示的数据结构信息）
 * block fields(控制列宽)
 *
 * model: business modelMeta
 * 
 * show view(schema->syncBlock->block-business model)
 * 
 */
export class TableSchema {
    private constructor(data) {
        for (var n in data) {
            if (n == 'fields') continue;
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
    creater: string;
    createDate: Date;
    fields: Field[] = [];
    get visibleFields(): Field[] {
        return this.fields.findAll(g => g.text && ![FieldType.id, FieldType.parentId, FieldType.icon, FieldType.cover, FieldType.description].includes(g.type))
    }
    get userFields(): Field[] {
        return this.fields.findAll(g => g.text && ![FieldType.id, FieldType.parentId, FieldType.icon, FieldType.cover, FieldType.description].includes(g.type) ? true : false);
    }
    get initUserFields() {
        return this.userFields.findAll(g => g.text && ![FieldType.creater, FieldType.modifyDate, FieldType.modifyer, FieldType.createDate, FieldType.autoIncrement, FieldType.sort].includes(g.type))
    }
    get allowSortFields() {
        return this.userFields.findAll(x => x.text && ![FieldType.formula, FieldType.image, FieldType.file, FieldType.audio, FieldType.video].includes(x.type) ? true : false)
    }
    text: string;
    views: {
        id: string,
        text: string,
        url: string,
        locker: {
            lock: boolean,
            date: number,
            userid: string
        }
    }[] = [];
    recordViews: {
        id: string, text: string,
        locker?: {
            lock: boolean,
            date: number,
            userid: string
        },
        type?: 'form' | 'card'
    }[] = [];
    modelMetaId?: string;
    getViewFields() {
        var fs = this.initUserFields;
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
    rowAdd(args: { data: Record<string, any>, pos: { id: string, pos: 'before' | 'after' } }) {
        return channel.put('/datastore/add', Object.assign({ schemaId: this.id }, args));
    }
    rowRank(args: { id: string, pos: { id: string, pos: 'before' | 'after' } }) {
        return channel.put('/datastore/rank', Object.assign({ schemaId: this.id }, args));
    }
    rowRemove(id: string) {
        return channel.del('/datastore/remove', Object.assign({ schemaId: this.id }, { dataId: id }));
    }
    rowGet(id: string) {
        return channel.get('/datastore/query', Object.assign({ schemaId: this.id }, { id }));
    }
    rowUpdate(args: { dataId: string, data: Record<string, any> }) {
        return channel.patch('/datastore/update', Object.assign({ schemaId: this.id }, args));
    }
    list(options: {
        page: number,
        size?: number,
        filter?: Record<string, any>,
        sorts?: Record<string, -1 | 1>
    }) {
        return channel.get('/datastore/query/list', Object.assign({ schemaId: this.id }, options));
    }
    all(options: {
        page: number,
        size?: number,
        filter?: Record<string, any>,
        sorts?: Record<string, -1 | 1>
    }) {
        return channel.get('/datastore/query/all', Object.assign({ schemaId: this.id }, options));
    }
    group(
        options: {
            filter?: Record<string, any>,
            size?: number,
            sorts?: Record<string, 1 | -1>,
            group: string
        }) {
        return channel.get('/datastore/group', Object.assign({ schemaId: this.id }, options));
    }
    statistics(options: {
        page?: number,
        size?: number,
        filter?: Record<string, any>,
        having?: Record<string, any>,
        sorts?: Record<string, 1 | -1>,
        groups: string[],
        aggregate?: Record<string, any>
    }) {
        return channel.get('/datastore/statistics', Object.assign({ schemaId: this.id }, options));
    }
    statisticValue(options: { filter?: Record<string, any>, indicator: string; }) {
        return channel.get('/datastore/statistics/value', Object.assign({ schemaId: this.id }, options));
    }
    fieldAdd(field: { text: string, type: FieldType, config?: Record<string, any> }) {
        return channel.put('/schema/operate', {
            operate: {
                schemaId: this.id,
                date: new Date(),
                actions: [{ name: 'addField', field }]
            }
        })
    }
    fieldRemove(fieldId: string) {
        return channel.put('/schema/operate', {
            operate: {
                schemaId: this.id,
                date: new Date(),
                actions: [{ name: 'removeField', fieldId }]
            }
        })
    }
    fieldUpdate(args: { fieldId: string, data: Record<string, any> }) {
        return channel.put('/schema/operate', {
            operate: {
                schemaId: this.id,
                date: new Date(),
                actions: [{ name: 'updateField', ...args }]
            }
        })
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
    /*
     * { name: 'createSchemaView', text: r.text, url: r.url }
     * { name: 'addField', field: { text: '状态', type: FieldType.option } }
     * { name: 'removeSchemaView', id: view.id }
     * { name: 'duplicateSchemaView',id:view.id,data:{snap:any}}
     * { name: 'updateSchemaView', id: view.id, data: { text: it.value } }
     * { name: 'updateSchema', data: { text: it.value } }
     * { name: 'moveSchemaView',id:view.id,data:{from:number,to:number}}
     */
    async onSchemaOperate(actions: {
        name: string,
        text?: string,
        url?: string,
        field?: Record<string, any>,
        id?: string,
        data?: Record<string, any>
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
                case 'removeSchemaView':
                    this.views.remove(g => g.id == action.id);
                    break;
                case 'updateSchemaView':
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
            }
        })
        return result;
    }
    static schemas: Map<string, TableSchema> = new Map();
    static async loadTableSchema(schemaId: string) {
        var schema = this.schemas.get(schemaId);
        if (schema) return schema;
        else {
            var r = await channel.get('/schema/query', { id: schemaId });
            if (r.ok) {
                schema = new TableSchema(r.data.schema);
                this.schemas.set(schemaId, schema);
                return schema;
            }
        }
    }
    static async loadListSchema(schemaIds: string[]) {
        var rs: TableSchema[] = [];
        for (let i = schemaIds.length - 1; i >= 0; i--) {
            var r = this.schemas.get(schemaIds[i]);
            if (r) {
                rs.push(r);
                schemaIds.splice(i, 1);
            }
        }
        if (schemaIds.length > 0) {
            var gs = await channel.get('/schema/ids/list', { ids: schemaIds });
            if (gs.ok) {
                rs.push(...gs.data.list.map(r => new TableSchema(r)));
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
    static async deleteTableSchema(schemaId: string) {
        await channel.del('/schema/delete', { id: schemaId });
        this.schemas.delete(schemaId);
    }
}




