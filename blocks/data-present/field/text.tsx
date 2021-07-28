import React from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { TextArea } from "../../../src/block/partial/appear";
import { BlockView } from "../../../src/block/view";
import { FieldType } from "../schema/field.type";
@url('/field/text')
export class FieldText extends Block {
    fieldType: FieldType;
    value: any;
}
@view('/field/text')
export class FieldTextView extends BlockView<FieldText>{
    render() {
        switch (this.block.fieldType)
        {
            case FieldType.text:
                return <div><TextArea html={this.block.value}></TextArea></div>
        }
    }
}