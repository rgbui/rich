import React from "react";
import { Block } from "../../../src/block";
import { BlockAppear, BlockDisplay } from "../../../src/block/enum";
import { url, view } from "../../../src/block/factory/observable";
import { TextArea } from "../../../src/block/partial/appear";
import { BlockView } from "../../../src/block/view";
import { FieldType } from "../schema/field.type";
@url('/field/option')
export class FieldOption extends Block {
    fieldType: FieldType;
    display = BlockDisplay.inline;
    appear = BlockAppear.text;
    get isSupportTextStyle() {
        return false;
    }
}
@view('/field/option')
export class FieldTextView extends BlockView<FieldOption>{
    render() {
        return <div className='sy-field-text'><TextArea html={this.block.htmlContent}></TextArea></div>
    }
}