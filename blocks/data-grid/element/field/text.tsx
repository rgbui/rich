import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
import { lst } from "../../../../i18n/store";
@url('/field/text')
export class FieldText extends OriginField {

}
@view('/field/text')
export class FieldTextView extends BlockView<FieldText>{
    render() {
        return <div className='sy-field-text f-14'><TextArea plain block={this.block} placeholder={lst( "输入文本")} prop='value' ></TextArea></div>
    }
}