import React from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { DataGridView } from "../../view/base/table";
import { OriginFilterField } from "./origin.field";

@url('/field/filter/number')
export class FilterFieldNumber extends OriginFilterField {
    @prop()
    refFieldId: string;
    get field() {
        return (this.refBlock as DataGridView)?.schema.fields.find(g => g.id == this.refFieldId);
    }
}
@view('/field/filter/number')
export class FilterFieldNumberView extends BlockView<FilterFieldNumber>{
    render() {
        return <div className='sy-filter-option'>
        </div>
    }
}