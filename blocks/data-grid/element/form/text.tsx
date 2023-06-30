import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";

@url('/form/text')
class FieldText extends OriginFormField {

}
@view('/form/text')
class FieldTextView extends BlockView<FieldText>{
    render() {
        var self = this;
        function keydown(event: React.KeyboardEvent<HTMLInputElement>) {
            if (event.key == 'Enter') {
                if(!self.block.isCanEdit())return;
                self.block.onChange((event.target as HTMLInputElement).value);
            }
        }
        return <FieldView block={this.block}>
            <input 
            className="sy-form-field-input-value"
            type='text'
            data-shy-page-no-focus={true}
            defaultValue={this.block.value}
            onInput={e => { this.block.value = (e.target as HTMLInputElement).value }}
            onKeyDown={e => keydown(e)}
        />
        </FieldView>
    }
}