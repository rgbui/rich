import { util } from "../../../util/util";
import { TableSchema } from "./meta";

export class FieldView {
    fieldId?: string;
    text?: string;
    value?: any;
    colWidth?: number;
    remark?: string;
    error?: string;
    sort?: 0 | 1 | -1 = 0;
    schema: TableSchema;
    get field() {
        if (this.fieldId) return this.schema.fields.find(g => g.id == this.fieldId);
    }
    constructor(schema: TableSchema, options?: Partial<FieldView>) { this.schema = schema; if (options) this.load(options) }
    load(options) {
        for (let n in options) {
            this[n] = options[n];
        }
    }
    get() {
        var json: Record<string, any> = {};
        for (var n in this) {
            if (typeof this[n] != 'function' && ['field','schema'].includes(n))
            {
                json[n] = util.clone(this[n]);
            }
        }
        return json;
    }
}