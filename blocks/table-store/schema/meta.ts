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
    async fieldAdd(field: { text: string, type: FieldType }) {

    }
    async fieldRemove(fieldId: string) {

    }
    async fieldUpdate(fieldId: string, data: Record<string, any>) {

    }
    async turnField(fieldId: string, type: FieldType) {

    }
    async rowAdd(data: Record<string, any>, pos: { id: string, pos: 'before' | 'after' }) {

    }
    async rowRemove(id: string) {

    }
    async rowGet(id: string) {

    }
    async rowUpdate(id: string, data: Record<string, any>) {

    }
    async list(options: {
        page: number,
        size?: number,
        fitler?: Record<string, any>,
        sorts?: Record<string, -1 | 1>
    }) {

    }
    async all(options: {
        page: number,
        size?: number,
        fitler?: Record<string, any>,
        sorts?: Record<string, -1 | 1>
    }) {

    }

    async statistics(options: { page?: number, size?: number, filter?: Record<string, any>, having?: Record<string, any>, sorts?: Record<string, 1 | -1>, groups: string[], aggregate: string[] }) {

    }
    async statisticValue(options: { filter?: Record<string, any>, indicator?: string[] }) {

    }
}


