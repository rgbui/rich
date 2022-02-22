import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField } from "./origin.field";

@url('/field/filter/search')
export class SearchText extends OriginFilterField {

}
@view('/field/filter/search')
export class SearchTextView extends BlockView<SearchText>{
    render() {
        return <div className='sy-filter-search'>
            <input type='text' />
        </div>
    }
}