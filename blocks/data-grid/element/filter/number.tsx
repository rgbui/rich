import lodash from "lodash";
import React from "react";
import { NsArowSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { SchemaFilter } from "../../schema/filter";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { lst } from "../../../../i18n/store";

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
        var rs: SchemaFilter[] = [];
        if (typeof this.min != 'undefined') {
            rs.push({
                field: this.field.name,
                operator: "$gte",
                value: this.min
            })
        }
        if (typeof this.max != 'undefined') {
            rs.push({
                field: this.field.name,
                operator: "$lte",
                value: this.max
            })
        }
        return rs;
    }
}

@view('/field/filter/number')
export class FilterFieldNumberView extends BlockView<FilterFieldNumber>{
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle} filterField={this.block}>
            <div className="flex-line flex round" style={{
                height: 28,
                width: '100%',
                boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px inset',
                // background: 'rgba(242, 241, 238, 0.6)',
                background: '#fff',
                borderRadius: 4,
                lineHeight: '26px'
            }}>
                <input
                    className="noborder placeholder-remark gap-l-10 no-bg  text-center f-14"
                    style={{ width: 40 }}
                    type='text'
                    placeholder={lst("起始值")}
                    onInput={e => this.block.numberChange((e.target as HTMLInputElement).value, 'min')}
                    defaultValue={typeof this.block.min == 'number' ? this.block.min.toString() : ''}
                />
                <span className="remark gap-w-5 flex-center h-20"><Icon size={16} rotate={90} icon={NsArowSvg} ></Icon></span>
                <input
                    className="noborder placeholder-remark no-bg text-center  f-14"
                    style={{ width: 40 }}
                    type='text'
                    placeholder={lst("结束值")}
                    onInput={e => this.block.numberChange((e.target as HTMLInputElement).value, 'max')}
                    defaultValue={typeof this.block.max == 'number' ? this.block.max.toString() : ''}
                />
            </div>
        </OriginFilterFieldView></div>
    }
}