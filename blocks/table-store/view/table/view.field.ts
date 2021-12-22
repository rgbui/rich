import { FieldType } from "../../schema/field.type";
export class TableStoreViewField {
    name?: string;
    display?: string;
    text?: string;
    type: FieldType;
    width: number;
    sort?: FieldSort
    constructor(options: Partial<TableStoreViewField>) {
        if (typeof options == 'object') {
            Object.assign(this, options);
        }
    }
    get() {
        return {
            name: this.name,
            display: this.display,
            text: this.text,
            type: this.type,
            width: this.width
        }
    }
    clone() {
        return new TableStoreViewField(this.get());
    }
    getValue(row) {
        if (typeof this.name == 'string')
            return row[this.name];
    }
}

export enum FieldSort {
    none,
    desc,
    asc
}