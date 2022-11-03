import lodash from "lodash";
import React from "react";
import { NsArowSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
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
        return <div className="flex-line flex-center padding-w-10 round" style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle} filterField={this.block}>
            <input
                style={{ width: 60 }}
                type='text'
                placeholder="起始值"
                onInput={e => this.block.numberChange((e.target as HTMLInputElement).value, 'min')}
                defaultValue={typeof this.block.min == 'number' ? this.block.min.toString() : ''}
            />
            <span className="remark gap-w-5 flex-center h-20"><Icon size={16} rotate={90} icon={NsArowSvg} ></Icon></span>
            <input
                style={{ width: 60 }}
                type='text'
                placeholder="结束值"
                onInput={e => this.block.numberChange((e.target as HTMLInputElement).value, 'max')}
                defaultValue={typeof this.block.max == 'number' ? this.block.max.toString() : ''}
            />
        </OriginFilterFieldView></div>
    }
}