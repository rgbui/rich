import lodash from "lodash";
import React from "react";
import { Input } from "../../../../component/view/input";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";

@url('/field/filter/search')
export class SearchText extends OriginFilterField {
    word: string = '';
    onInputValue = lodash.debounce((value) => {
        this.word = value;
        if (this.refBlock)
            this.refBlock.onSearch();
    }, 1200)
    get filters() {
        if (!this.word) return null
        return [{
            field: this.field.name,
            operator: '$startWith',
            value: this.word
        }]
    }
}

@view('/field/filter/search')
export class SearchTextView extends BlockView<SearchText>{
    render() {
        var self = this;
        return <div style={this.block.visibleStyle}><OriginFilterFieldView
            style={this.block.contentStyle}
            filterField={this.block}>
            <Input
                value={this.block.word}
                onChange={e => this.block.onInputValue(e)}
                onEnter={e => { self.block.refBlock.onSearch() }}
            ></Input>
        </OriginFilterFieldView ></div>
    }
}