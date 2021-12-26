import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFormField } from "./origin.field";
import { FieldView } from "./view";

@url('/form/check')
class FieldText extends OriginFormField {

}
@view('/form/check')
class FieldTextView extends BlockView<FieldText>{
    render() {
        var self = this;
        function keydown(event: React.KeyboardEvent<HTMLInputElement>) {
            if (event.key == 'Enter') {
                self.block.onChange((event.target as HTMLInputElement).value);
            }
        }
        return <FieldView text={this.block.field.text}><input
            type='checkbox'
            checked={this.block.value}
            onChange={e => this.block.onChange((e.target as HTMLInputElement).checked)}
            onKeyDown={e => keydown(e)}
        />
        </FieldView>
    }
}