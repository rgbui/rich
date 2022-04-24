import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
@url('/field/text')
export class FieldText extends OriginField {

}
@view('/field/text')
export class FieldTextView extends BlockView<FieldText>{
    render() {
        return <div className='sy-field-text'><TextArea  block={this.block}   placeholder="输入文本" prop='value' ></TextArea></div>
    }
}