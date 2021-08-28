import React from "react";
import { url, view } from "../../../src/block/factory/observable";
import { TextArea } from "../../../src/block/view/appear";
import { BlockView } from "../../../src/block/view";
import { FieldType } from "../schema/field.type";
import { OriginField } from "./origin.field";
@url('/field/number')
export class FieldNumber extends OriginField {
    get isSupportAnchor() {
        if (this.fieldType == FieldType.autoIncrement) return false;
        return super.isSupportAnchor;
    }
    get appearElements() {
        if (this.fieldType == FieldType.autoIncrement) return [];
        else return this.__appearElements;
    }
}
@view('/field/number')
export class FieldTextView extends BlockView<FieldNumber>{
    render() {
        if (this.block.fieldType == FieldType.autoIncrement)
            return <div className='sy-field-text'>{this.block.htmlContent}</div>
        else
            return <div className='sy-field-text'><TextArea rf={e => this.block.elementAppear({ el: e })} html={this.block.htmlContent}></TextArea></div>
    }
}