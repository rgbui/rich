import { FieldType } from "./field.type";
export class ViewField {
    name?: string;
    display?: string;
    text?: string;
    type: FieldType;
    width: number;
    constructor(options: Partial<ViewField>) {
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
        return new ViewField(this.get());
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