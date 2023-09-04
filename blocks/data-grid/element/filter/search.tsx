import lodash from "lodash";
import React from "react";
import { Input } from "../../../../component/view/input";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { Icon } from "../../../../component/view/icon";
import { SearchSvg } from "../../../../component/svgs";

@url('/field/filter/search')
export class SearchText extends OriginFilterField {
    word: string = '';
    onInputValue = lodash.debounce((value) => {
        this.onForceInput(value);
    }, 1200)
    onForceInput(value: string) {
        this.word = value;
        if (this.refBlock)
            this.refBlock.onSearch();
    }
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
    renderView() {
        var self = this;
        return <div style={this.block.visibleStyle}>
            <OriginFilterFieldView
                style={this.block.contentStyle}
                filterField={this.block}>
                <Input
                    prefix={<span className="size-24 flex-center cursor"><Icon className={'remark'} size={16} icon={SearchSvg}></Icon></span>}
                    value={this.block.word}
                    onChange={e => this.block.onInputValue(e)}
                    onEnter={e => { self.block.refBlock.onSearch() }}
                    clear
                    onClear={() => {
                        self.block.onForceInput('');
                    }}
                ></Input>
            </OriginFilterFieldView >
        </div>
    }
}