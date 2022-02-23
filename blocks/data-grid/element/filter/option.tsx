import React from "react";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { DataGridView } from "../../view/base/table";
import { OriginFilterField } from "./origin.field";

@url('/field/filter/option')
export class FilterFieldOption extends OriginFilterField {
  
}
@view('/field/filter/option')
export class FilterFieldOptionView extends BlockView<FilterFieldOption>{
    renderOptions() {
        return <div>
            <a>全部</a>
            {this.block.field?.config.options.map(g => {
                return <a key={g.value}>{g.text}</a>
            })}</div>
    }
    render() {
        return <div className='sy-filter-option'>
            {this.renderOptions()}
        </div>
    }
}