import { channel } from "../../../net/channel";
import { Field } from "./field";
import { FieldType } from "./type";
import { ViewField } from "./view";
export class TableSchema {
    constructor(data) {
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
    creater: string;
    createDate: Date;
    fields: Field[] = [];
    text: string;
    views: { id: string, text: string, url: string }[] = [];
    recordViews: { id: string, text: string, type?: 'form' | 'card' }[] = [];
    getViewFields() {
        var fs = this.fields.findAll(g => g.text ? true : false);
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
    turnField(args: { fieldId: string, type: FieldType }) {
        return channel.put('/schema/operate', {
            operate: {
                schemaId: this.id,
                date: new Date(),
                actions: [{ name: 'turnField', ...args }]
            }
        })
    }
    rowAdd(args: { data: Record<string, any>, pos: { dataId: string, pos: 'before' | 'after' } }) {
        return channel.put('/datastore/add', Object.assign({ schemaId: this.id }, args));
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
}


