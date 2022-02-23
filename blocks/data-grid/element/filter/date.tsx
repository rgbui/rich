import React from "react";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { DataGridView } from "../../view/base/table";
import { OriginFilterField } from "./origin.field";

@url('/field/filter/date')
export class FilterFieldDate extends OriginFilterField {
    @prop()
    refFieldId: string;
    get field() {
        return (this.refBlock as DataGridView)?.schema.fields.find(g => g.id == this.refFieldId);
    }
}
@view('/field/filter/date')
export class FilterFieldDateView extends BlockView<FilterFieldDate>{
    render() {
        return <div className='sy-filter-option'>

        </div>
    }
}