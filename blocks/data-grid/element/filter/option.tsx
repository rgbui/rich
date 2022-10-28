import React from "react";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItemType } from "../../../../component/view/menu/declare";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";

@url('/field/filter/option')
export class FilterFieldOption extends OriginFilterField {
    values: string[] = [];
    @prop()
    isMultiple: boolean = false;
    @prop()
    format: 'select' | 'expose' = 'expose';
    onFilter(value, force?: boolean) {
        if (force == true) {
            this.values = value;
        }
        else {
            if (this.isMultiple) {
                if (!this.values.includes(value)) {
                    this.values.push(value)
                }
            }
            else this.values = [value];
        }
        if (this.refBlock) this.refBlock.onSearch();
    }
    get filters() {
        if (this.values.length == 0) return {}
        return {
            [this.field.name]: {
                $in: this.values
            }
        }
    }
}
@view('/field/filter/option')
export class FilterFieldOptionView extends BlockView<FilterFieldOption>{
    renderOptions() {
        var self = this;
        if (this.block.format == 'select') {
            async function select(event: React.MouseEvent) {
                var rs = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, [
                    { text: '选择选项', type: MenuItemType.text },
                    { text: '全部', name: 'all', checkLabel: self.block.values.length == 0 ? true : false },
                    ...self.block.field.config.options.map(op => {
                        return {
                            text: op.text,
                            value: op.value,
                            checkLabel: self.block.values.includes(op.value)
                        }
                    })
                ]);
                if (rs?.item) {
                    if (rs.item.name == 'all') self.block.onFilter([], true)
                    else if (rs.item.value) self.block.onFilter(rs.item.value)
                }
            }
            var ops = this.block.field.config.options.findAll(g => this.block.values.includes(g.value));
            if (ops.length == 0) return <span onMouseDown={e => select(e)}>全部</span>
            else return <div onMouseDown={e => select(e)}>{ops.map(op => { return <span key={op.value}>{op.text}</span> })}</div>
        }
        else return <div>
            <a onClick={e => {
                this.block.onFilter([], true)
            }}>全部</a>
            {this.block.field?.config.options.map(g => {
                return <a className={this.block.values.includes(g.value) ? "hover" : ""} key={g.value} onClick={e => {
                    this.block.onFilter(g.value);
                }}>{g.text}</a>
            })}</div>
    }
    render() {
        return <OriginFilterFieldView filterField={this.block}>
            {this.renderOptions()}
        </OriginFilterFieldView>
    }
}