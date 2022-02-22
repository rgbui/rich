import React from "react";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField } from "./origin.field";

@url('/field/filter/option')
export class SearchText extends OriginFilterField {
    @prop()
    refFieldIds: string[] = [];
    word: string = '';
}
@view('/field/filter/option')
export class SearchTextView extends BlockView<SearchText>{
    render() {
        function keydown(e: KeyboardEvent) {
            if (e.code == 'Enter') {

            }
        }
        return <div className='sy-filter-option'>

        </div>
    }
}