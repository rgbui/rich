
import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { cacFormulaValue } from "../../schema/util";
import { OriginField, OriginFileView } from "./origin.field";

@url('/field/formula')
export class FieldFormula extends OriginField {

}
@view('/field/formula')
export class FieldFormulaView extends OriginFileView<FieldFormula>{
    renderFieldValue()  {
        return <div className="sy-field-formula f-14"  >
            {cacFormulaValue(this.block.dataGrid.schema, this.block.field, this.block.item.dataRow)}
        </div>
    }
}