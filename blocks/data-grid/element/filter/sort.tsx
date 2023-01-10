import React from "react";
import { ArrowDownSvg, ArrowUpSvg } from "../../../../component/svgs";
import { SelectBox } from "../../../../component/view/select/box";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";

@url('/field/filter/sort')
export class FilterSort extends OriginFilterField {
    onFilter(value: number) {
        this.sortRule = value;
        if (this.refBlock) this.refBlock.onSearch()
        this.forceUpdate()
    }
    sortRule: number = 0;
    getSort() {
        if (this.sortRule !== 0)
            return {
                [this.field.name]: this.sortRule
            }
    }
}
@view('/field/filter/sort')
export class SearchTextView extends BlockView<FilterSort>{
    render() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle}
            filterField={this.block}>
            <SelectBox
                small
                border
                inline
                value={this.block.sortRule}
                onChange={e => this.block.onFilter(e)}
                options={[
                    { text: '无', value: 0 },
                    { text: "升序", value: 1, icon: ArrowUpSvg },
                    { text: '降序', value: -1, icon: ArrowDownSvg }
                ]}></SelectBox>
        </OriginFilterFieldView ></div>
    }
}

