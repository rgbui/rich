import React from "react";

import { url, view } from "../../../src/block/factory/observable";
import { TextArea } from "../../../src/block/view/appear";
import { BlockView } from "../../../src/block/view";
import { OriginField } from "./origin.field";
@url('/field/option')
export class FieldOption extends OriginField {

}
@view('/field/option')
export class FieldTextView extends BlockView<FieldOption>{
    render() {
        return <div className='sy-field-text'><TextArea html={this.block.htmlContent}></TextArea></div>
    }
}