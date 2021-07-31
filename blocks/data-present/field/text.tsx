import React from "react";
import { Block } from "../../../src/block";
import { BlockAppear, BlockDisplay } from "../../../src/block/enum";
import { url, view } from "../../../src/block/factory/observable";
import { TextArea } from "../../../src/block/partial/appear";
import { BlockView } from "../../../src/block/view";
import { FieldType } from "../schema/field.type";
@url('/field/text')
export class FieldText extends Block {
    fieldType: FieldType;
    display = BlockDisplay.inline;
    appear = BlockAppear.text;
    get isSupportTextStyle() {
        return false;
    }
}
@view('/field/text')
export class FieldTextView extends BlockView<FieldText>{
    render() {
        return <div className='sy-field-text'><TextArea html={this.block.htmlContent}></TextArea></div>
    }
}