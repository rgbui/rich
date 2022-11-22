import lodash from "lodash";
import { EmojiCode } from "../../../extensions/emoji/store";
import { util } from "../../../util/util";
import { FieldType, sysFieldTypes } from "./type";

export class Field {
    id: string;
    name: string;
    text: string;
    type: FieldType;
    load(col: Record<string, any>) {
        for (var n in col) {
            if (n == 'type') {
                if (typeof col.type == 'string') {
                    col.type = FieldType[col.type] as any;
                }
                else lodash.set(this, 'type', col[n])
            }
            else lodash.set(this, n, util.clone(col[n]))
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
    getValue(row) {
        if (sysFieldTypes.includes(this.type)) {
            return row[FieldType[this.type]];
        }
        if (this?.name) return row[this.name];
    }
}

export interface DataGridOptionType {
    text: string,
    value: string,
    color: string;
}

export interface FieldConfig {
    options?: DataGridOptionType[];
    isMultiple?: boolean,
    relationTableId?: string,
    rollupTableId?: string,
    rollupFieldId?: string,
    rollupStatistic?: string,
    formula?: string,
    emoji?: EmojiCode,
    dateFormat?: string,
    includeTime?: boolean,
    numberFormat?: string,
    numberRadix?: string,
    imageFormat?: {
        display: 'thumb' | 'auto',
        multipleDisplay: "tile" | 'carousel'
    }
}

