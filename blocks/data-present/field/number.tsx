import React from "react";
import { Block } from "../../../src/block";
import { BlockAppear, BlockDisplay } from "../../../src/block/enum";
import { url, view } from "../../../src/block/factory/observable";
import { TextArea } from "../../../src/block/partial/appear";
import { BlockView } from "../../../src/block/view";
import { FieldType } from "../schema/field.type";
@url('/field/number')
export class FieldNumber extends Block {
    fieldType: FieldType;
    display = BlockDisplay.inline;
    appear = BlockAppear.text;
    get isSupportAnchor() {
        if (this.fieldType == FieldType.autoIncrement) return false;
        return super.isSupportAnchor;
    }
    get isSupportTextStyle() {
        return false;
    }
}
@view('/field/number')
export class FieldTextView extends BlockView<FieldNumber>{
    render() {
        if (this.block.fieldType == FieldType.autoIncrement)
            return <div className='sy-field-text'>{this.block.htmlContent}</div>
        else
            return <div className='sy-field-text'><TextArea html={this.block.htmlContent}></TextArea></div>
    }
}