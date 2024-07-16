
import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { OriginField, OriginFileView } from "./origin.field";
import { cacFormulaValue } from "../../../../extensions/data-grid/formula/run";

@url('/field/formula')
export class FieldFormula extends OriginField {
    cacValue;
    async didMounted() {
        this.cacFieldValue()
    }
    async cacFieldValue() {
        var v = await cacFormulaValue(this.page, this.dataGrid, this.field, this.dataGridItem.dataRow);
        if (typeof v == 'number') {
            var vt = v.toString();
            if (vt.indexOf('.') > -1) {
                v = v.toFixed(2);
                v = parseFloat(v);
            }
        }
        this.cacValue = v;
        this.forceManualUpdate()
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