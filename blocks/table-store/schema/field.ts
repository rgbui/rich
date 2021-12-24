import lodash from "lodash";
import { FieldType } from "./field.type";
export class Field {
    id: string;
    name: string
    text: string
    type: FieldType
    load(col: Record<string, any>) {
        for (var n in col) {
            if (n == 'type') {
                if (typeof col.type == 'string') {
                    col.type = FieldType[col.type] as any;
                }
                else this.type = col[n];
            }
            else this[n] = col[n];
        }
    }
    get() {
        return {
            name: this.name,
            text: this.text,
            type: this.type,
            config: lodash.cloneDeep(this.config)
        }
    }
    config?: FieldConfig
}
export interface FieldConfig {
    options?: { text: string, color: string }[];
}

