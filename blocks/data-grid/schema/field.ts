import lodash from "lodash";
import { EmojiCode } from "../../../extensions/emoji/store";
import { util } from "../../../util/util";
import { FieldType } from "./type";
export class Field {
    id: string;
    name: string;
    text: string;
    type: FieldType;
    required: boolean;
    load(col: Record<string, any>) {
        for (var n in col) {
            if (n == 'type') {
                if (typeof col.type == 'string') {
                    col.type = FieldType[col.type] as any;
                }
                else this.type = col[n];
            }
            else this[n] = util.clone(col[n]);
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
    config?: FieldConfig;
    update(data) {
        for (let n in data) {
            this[n] = data[n];
        }
    }
    getDefaultValue() {
        return undefined;
    }
}
export interface FieldConfig {
    options?: { text: string, value: string, color: string }[];
    isMultiple?: boolean
    relationTableId?: string,
    rollupTableId?: string,
    rollupFieldId?: string,
    rollupStatistic?: string,
    formula?: string,
    emoji?: EmojiCode,
    dateFormat?: string,
    includeTime?: boolean
}

