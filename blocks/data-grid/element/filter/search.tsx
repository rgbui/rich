import React from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField } from "./origin.field";

@url('/field/filter/search')
export class SearchText extends OriginFilterField {
    @prop()
    refFieldIds: string[] = [];
    word: string = '';
}
@view('/field/filter/search')
export class SearchTextView extends BlockView<SearchText>{
    render() {
        var self = this;
        function keydown(e: KeyboardEvent) {
            if (e.code == 'Enter') {
                self.block.refBlock.onSearch();
            }
        }
        return <div className='sy-filter-search'>
            <input type='text' value={this.block.word} onInput={e => { this.block.word = (e.target as HTMLInputElement).value }} onKeyDown={e => keydown} />
        </div>
    }
}