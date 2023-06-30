import React from "react";
import { InputNumber } from "../../../../component/view/input/number";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";
@url('/form/number')
class FieldText extends OriginFormField {

}
@view('/form/number')
class FieldTextView extends BlockView<FieldText>{
    render() {
        var self = this;
        return <FieldView block={this.block}>
            <InputNumber
                value={this.block.value}
                onChange={e => this.block.onInput(e)}
                onEnter={e => self.block.onChange(e)}
            ></InputNumber>
        </FieldView>
    }
}