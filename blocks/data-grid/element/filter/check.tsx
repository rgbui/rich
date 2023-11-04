import React from "react";
import { CheckBox } from "../../../../component/view/checkbox";
import { Switch } from "../../../../component/view/switch";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { TextArea } from "../../../../src/block/view/appear";
import { lst } from "../../../../i18n/store";

@url('/field/filter/check')
export class FilterFieldCheck extends OriginFilterField {
    checked: boolean = false;
    @prop()
    format: 'checkbox' | 'toggle' = 'checkbox';
    @prop()
    checkLabel: string = '';
    onFilter(checked: boolean) {
        this.checked = checked;
        if (this.refBlock) this.refBlock.onSearch();
    }
    get filters() {
        if (this.checked)
            return [{
                field: this.field.name,
                value: this.checked,
                operator: '$eq'
            }]
    }
}
@view('/field/filter/check')
export class FilterFieldCheckView extends BlockView<FilterFieldCheck>{
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle} filterField={this.block}>
            {this.block.format == 'checkbox' && <CheckBox checked={this.block.checked}
                onChange={e => {
                    this.block.onFilter(e)
                }}></CheckBox>}
            {this.block.format == 'toggle' && <Switch checked={this.block.checked}
                onChange={e => {
                    this.block.onFilter(e)
                }}></Switch>}
            <TextArea plain placeholder={lst("输入待办内容")} prop="checkLabel" block={this.block} ></TextArea>
        </OriginFilterFieldView></div>
    }
}