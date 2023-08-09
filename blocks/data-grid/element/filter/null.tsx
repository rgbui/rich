import React from "react";
import { CheckBox } from "../../../../component/view/checkbox";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { lst } from "../../../../i18n/store";

/**
 * 判断字段是否有值，无值
 */
@url('/field/filter/null')
export class FieldFilterNull extends OriginFilterField {
    isNull: boolean = false;
    onFilter(value: boolean) {
        this.isNull = value;
        if (this.refBlock) this.refBlock.onSearch()
    }
    get filters() {
        if (this.isNull == false) return null;
        return [
            {
                name: this.field.name,
                $operator: '$ne',
                value: null
            }
        ]
    }
}

@view('/field/filter/null')
export class SearchTextView extends BlockView<FieldFilterNull>{
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle}
            filterField={this.block}>
            <CheckBox checked={this.block.isNull}
                onChange={e => {
                    this.block.onFilter(e)
                }}>{this.block.isNull ? lst("空") : lst("有")}</CheckBox>
        </OriginFilterFieldView ></div>
    }
}