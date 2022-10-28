import lodash from "lodash";
import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";

@url('/field/filter/number')
export class FilterFieldNumber extends OriginFilterField {
    min: number = undefined;
    max: number = undefined;
    numberChange = lodash.debounce((value: string, name: string) => {
        var r = parseFloat(value);
        if (isNaN(r)) this[name] = undefined
        else this[name] = r;
        if (this.refBlock) this.refBlock.onSearch()
    }, 1000);
    get filters() {
        return {
            [this.field.name]: {
                $gte: this.min,
                $lte: this.max
            }
        }
    }
}

@view('/field/filter/number')
export class FilterFieldNumberView extends BlockView<FilterFieldNumber>{
    render() {
        return <OriginFilterFieldView filterField={this.block}>
            <input
                type='text'
                onInput={e => this.block.numberChange((e.target as HTMLInputElement).value, 'min')}
                defaultValue={typeof this.block.min == 'number' ? this.block.min.toString() : ''}
            />
            <span>-</span>
            <input
                type='text'
                onInput={e => this.block.numberChange((e.target as HTMLInputElement).value, 'max')}
                defaultValue={typeof this.block.max == 'number' ? this.block.max.toString() : ''}
            />
        </OriginFilterFieldView>
    }
}