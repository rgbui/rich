import { channel } from "../../../net/channel";
import { Field } from "./field";
import { FieldType } from "./type";
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
    getViewFields() {
        var fs = this.fields.filter(g => [
            FieldType.id,
            FieldType.createDate,
            FieldType.sort,
            FieldType.autoIncrement
        ].includes(g.type));
        return fs.map(f => {
            return {
                fieldId: f.id
            }
        })
    }
    fieldAdd(field: { text: string, type: FieldType }) {
        return channel.put('/schema/field/add', Object.assign({ schemaId: this.id }, field));
    }
    fieldRemove(fieldId: string) {
        return channel.del('/schema/field/remove', Object.assign({ schemaId: this.id }, { fieldId }));
    }
    fieldUpdate(args: { fieldId: string, data: Record<string, any> }) {
        return channel.post('/schema/field/update', Object.assign({ schemaId: this.id }, args));
    }
    turnField(args: { fieldId: string, type: FieldType }) {
        return channel.post('/schema/field/turn', Object.assign({ schemaId: this.id }, args));
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
        return channel.post('/datastore/update', Object.assign({ schemaId: this.id }, args));
    }
    list(options: {
        page: number,
        size?: number,
        fitler?: Record<string, any>,
        sorts?: Record<string, -1 | 1>
    }) {
        console.log(this);
        return channel.get('/datastore/query/list', Object.assign({ schemaId: this.id }, options));
    }
    all(options: {
        page: number,
        size?: number,
        fitler?: Record<string, any>,
        sorts?: Record<string, -1 | 1>
    }) {
        return channel.get('/datastore/query/all', Object.assign({ schemaId: this.id }, options));
    }
    statistics(options: { page?: number, size?: number, filter?: Record<string, any>, having?: Record<string, any>, sorts?: Record<string, 1 | -1>, groups: string[], aggregate: string[] }) {
        return channel.get('/datastore/statistics', Object.assign({ schemaId: this.id }, options));
    }
    statisticValue(options: { filter?: Record<string, any>, indicator: string[]; }) {
        return channel.get('/datastore/statistics/value', Object.assign({ schemaId: this.id }, options));
    }
}


