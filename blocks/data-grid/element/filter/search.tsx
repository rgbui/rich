import lodash from "lodash";
import React from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";

@url('/field/filter/search')
export class SearchText extends OriginFilterField {
    @prop()
    refFieldIds: string[] = [];
    word: string = '';
    onInputValue = lodash.debounce((value) => {
        this.word = value;
        this.refBlock.onSearch();
    }, 1200)
    get filters() {
        if (!this.word) return {}
        return {
            [this.field.name]: {
                $startWith: this.word
            }
        }
    }
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
        return <OriginFilterFieldView
            filterField={this.block}>
            <input type='text'
                value={this.block.word}
                onInput={e => this.block.onInputValue((e.target as HTMLInputElement).value)}
                onKeyDown={e => keydown} />
        </OriginFilterFieldView >
    }
}