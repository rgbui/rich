import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";
import { CheckBox } from "../../../../component/view/checkbox";

@url('/form/check')
class FieldText extends OriginFormField {

}
@view('/form/check')
class FieldTextView extends BlockView<FieldText>{
    renderView() {
        var self = this;
        return <FieldView block={this.block}>
            <CheckBox checked={this.block.value}
                onChange={e => {
                    this.block.onChange(e);
                }}></CheckBox>
        </FieldView>
    }
}