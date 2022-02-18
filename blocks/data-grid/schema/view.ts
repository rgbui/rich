import { util } from "../../../util/util";
import { TableSchema } from "./meta";

export class ViewField {
    fieldId?: string;
    text?: string;
    value?: any;
    colWidth?: number = 120;
    remark?: string;
    error?: string;
    schema: TableSchema;
    get field() {
        if (this.fieldId) return this.schema.fields.find(g => g.id == this.fieldId);
    }
    constructor(options?: Partial<ViewField>, schema?: TableSchema) {
        if (options) this.load(options)
        if (schema) this.schema = schema;
    }
    load(options) {
        for (let n in options) {
            this[n] = options[n];
        }
    }
    get() {
        var json: Record<string, any> = {};
        var keys = ['fieldId', 'text', 'value', 'colWidth', 'remark', 'error', 'sort'];
        keys.forEach(n => {
            json[n] = util.clone(this[n]);
        })
        return json;
    }
    clone() {
        return new ViewField(this.get(),this.schema)
    }
    getValue(row) {
        if (this?.field?.name) return row[this.field.name];
    }
}