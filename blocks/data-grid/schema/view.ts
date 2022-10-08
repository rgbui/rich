import { util } from "../../../util/util";
import { TableSchema } from "./meta";
export class ViewField {
    id: string;
    fieldId?: string;
    text?: string;
    colWidth: number = 120;
    schema: TableSchema;
    type?: 'rowNum' | 'check' | undefined;
    get field() {
        if (this.fieldId) return this.schema.fields.find(g => g.id == this.fieldId);
    }
    constructor(options?: Partial<ViewField>, schema?: TableSchema) {
        this.id = util.guid();
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
        var keys = [
            'id',
            'fieldId',
            'text',
            'colWidth',
            'type'
        ];
        keys.forEach(n => {
            json[n] = util.clone(this[n]);
        })
        return json;
    }
    clone() {
        return new ViewField(this.get(), this.schema)
    }
    getValue(row) {
        if (this?.field?.name) return row[this.field.name];
    }
    isSame(vf: ViewField) {
        if (vf.fieldId === this.fieldId) return true;
        if (!vf.fieldId && !this.fieldId) {
            if (this.type == vf.type) return true;
        }
        return false;
    }
}

