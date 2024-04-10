
import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { OriginField, OriginFileView } from "./origin.field";
import { cacFormulaValue } from "../../../../extensions/data-grid/formula/run";

@url('/field/formula')
export class FieldFormula extends OriginField {
    cacValue;
    async didMounted() {
        this.cacValue = await cacFormulaValue(this.page, this.dataGrid.schema, this.field, this.item.dataRow);
        this.forceUpdate()
    }
}
@view('/field/formula')
export class FieldFormulaView extends OriginFileView<FieldFormula> {
    renderFieldValue() {
        return <div className="sy-field-formula f-14"  >
            {this.block.cacValue}
        </div>
    }
}