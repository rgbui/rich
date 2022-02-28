import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";


@url('/form/check')
class FieldText extends OriginFormField {

}
@view('/form/check')
class FieldTextView extends BlockView<FieldText>{
    render() {
        var self = this;
        return <FieldView block={this.block}><input
            type='checkbox'
            checked={this.block.value}
            onChange={e => this.block.onChange((e.target as HTMLInputElement).checked)}
        />
        </FieldView>
    }
}