
import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/formula')
export class FieldFormula extends OriginField {

}
@view('/field/formula')
export class FieldFormulaView extends BlockView<FieldFormula>{
    render() {
        return <div className="sy-field-formula">

        </div>
    }
}