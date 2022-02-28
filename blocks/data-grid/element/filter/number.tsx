import React from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField } from "./origin.field";

@url('/field/filter/number')
export class FilterFieldNumber extends OriginFilterField {

}
@view('/field/filter/number')
export class FilterFieldNumberView extends BlockView<FilterFieldNumber>{
    render() {
        return <div className='sy-filter-option'>
        </div>
    }
}