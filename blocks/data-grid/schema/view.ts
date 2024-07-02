import { IconArguments } from "../../../extensions/icon/declare";
import { util } from "../../../util/util";
import { TableSchema } from "./meta";
import { FieldType, SysFieldTypes } from "./type";
export class ViewField {
    id: string;
    icon?: IconArguments;
    fieldId?: string;
    text?: string;
    colWidth: number = 120;
    schema: TableSchema;
    type?: 'rowNum' | 'check' | undefined;
    get field() {
        if (this.fieldId&&this.schema) return this.schema.fields.find(g => g.id == this.fieldId);
    }
    constructor(
        options?: Partial<ViewField>,
        schema?: TableSchema
    ) {
        this.id = util.guid();
        if (options) this.load(options);
        if (schema) {
            this.schema = schema;
            if (typeof options.colWidth == 'undefined' && this.field?.type && [FieldType.video, FieldType.audio, FieldType.image].includes(this.field.type)) {
                this.colWidth = 240;
            }
            else if (typeof options.colWidth == 'undefined' && this.field?.type && [FieldType.button].includes(this.field.type)) {
                this.colWidth = 150;
            }
        }
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
            'type',
            'icon'
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
        if (SysFieldTypes.includes(this.field.type)) {
            return row[FieldType[this.field.type]];
        }
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

