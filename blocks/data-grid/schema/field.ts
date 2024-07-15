import lodash from "lodash";
import { EmojiCode } from "../../../extensions/emoji/store";
import { util } from "../../../util/util";
import { FieldType, SysFieldTypes } from "./type";
import { IconArguments } from "../../../extensions/icon/declare";

export class Field {
    id: string;
    name: string;
    text: string;
    type: FieldType;
    icon: IconArguments;
    visible: boolean;
    load(col: Record<string, any>) {
        for (let n in this) {
            if (n.indexOf('.') > -1) delete this[n];
        }
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
            config: lodash.cloneDeep(this.config),
            icon: this.icon,
            visible: this.visible
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
        if (SysFieldTypes.includes(this.type)) {
            return row[FieldType[this.type]];
        }
        if (this?.name) return row[this.name];
    }
}

export interface DataGridOptionType {
    text: string,
    value: string,
    /**
     * 旧的option bg color
     */
    color?: string;
    /**
     * 新的option增加fill及textColor
     */
    fill?: string;
    textColor?: string;
}

export interface FieldConfig {
    options?: DataGridOptionType[];
    isMultiple?: boolean,
    relationTableId?: string,
    relationVisibleFieldId?: string,
    relationDouble?: boolean,
    relationFieldText?: string,
    relationFieldId?: string,
    /**
     * 当打开relation选择框时，里面的数据显示属性是以fieldProps为准的
     */
    fieldProps?: string[];
    /**
     * 废弃
     */
    // rollupTableId?: string,
    rollupRelationFieldId?: string,
    rollupFieldId?: string,
    rollupStatistic?: string,
    formula?: { formula: string, jsCode: string, exp: any, jx?: any },
    emoji?: EmojiCode,
    dateFormat?: string,
    includeTime?: boolean,
    numberFormat?: string,
    numberDisplay?: {
        display: 'auto' | 'percent' | 'ring',
        decimal: number,
        color: string,
        showNumber: boolean,
    },
    imageFormat?: {
        display: 'thumb' | 'auto',
        multipleDisplay: "tile" | 'carousel'
    }
}

