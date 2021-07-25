import { Field } from "./field";
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
}


