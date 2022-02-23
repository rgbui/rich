import React from "react";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { DataGridView } from "../../view/base/table";
import { OriginFilterField } from "./origin.field";

@url('/field/filter/check')
export class FilterFieldCheck extends OriginFilterField {
    @prop()
    refFieldId: string;
    get field() {
        return (this.refBlock as DataGridView)?.schema.fields.find(g => g.id == this.refFieldId);
    }
}
@view('/field/filter/check')
export class FilterFieldCheckView extends BlockView<FilterFieldCheck>{
    render() {
        return <div className='sy-filter-option'>
            <input type='checkbox' />
        </div>
    }
}