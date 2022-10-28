import React from "react";
import { CheckBox } from "../../../../component/view/checkbox";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";

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
        if (this.isNull == false) return {}
        return {
            [this.field.name]: { $ne: null }
        }
    }
}

@view('/field/filter/null')
export class SearchTextView extends BlockView<FieldFilterNull>{
    render() {
        return <OriginFilterFieldView
            filterField={this.block}>
            <CheckBox checked={this.block.isNull}
                onChange={e => {
                    this.block.onFilter(e)
                }}>{this.block.isNull ? "空" : "有"}</CheckBox>
        </OriginFilterFieldView >
    }
}