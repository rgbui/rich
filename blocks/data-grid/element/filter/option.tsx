import React from "react";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField } from "./origin.field";


@url('/field/filter/option')
export class FilterFieldOption extends OriginFilterField {
    values: string[] = [];
    @prop()
    isMultiple: boolean = false;
}
@view('/field/filter/option')
export class FilterFieldOptionView extends BlockView<FilterFieldOption>{
    renderOptions() {
        return <div>
            <a onClick={e => {
                this.block.values = [];
                this.block.refBlock.onSearch();
            }}>全部</a>
            {this.block.field?.config.options.map(g => {
                return <a className={this.block.values.includes(g.value) ? "hover" : ""} key={g.value} onClick={e => {
                    if (this.block.isMultiple) { if (!this.block.values.includes(g.value)) { this.block.values.push(g.value) } }
                    else this.block.values = [g.value];
                    this.block.refBlock.onSearch();
                }}>{g.text}</a>
            })}</div>
    }
    render() {
        return <div className='sy-filter-option'>
            {this.renderOptions()}
        </div>
    }
}