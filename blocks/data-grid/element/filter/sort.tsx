import React from "react";
import { SelectBox } from "../../../../component/view/select/box";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { lst } from "../../../../i18n/store";

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
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView
            style={this.block.contentStyle}
            filterField={this.block}>
            <SelectBox
                small
                border
                inline
                value={this.block.sortRule}
                onChange={e => this.block.onFilter(e as number)}
                options={[
                    { text: lst('默认'), value: 0, icon: { name: 'bytedance-icon', code: 'align-text-both' } },
                    { text: lst("升序"), value: 1, icon: { name: 'bytedance-icon', code: 'sort-amount-up' } },
                    { text: lst('降序'), value: -1, icon: { name: 'bytedance-icon', code: 'sort-amount-down' } }
                ]}></SelectBox>
        </OriginFilterFieldView ></div>
    }
}

