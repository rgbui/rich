import React from "react";
import { RichView } from "../../../../component/view/rich";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";
@url('/form/rich')
class FieldRich extends OriginFormField {
    async onInputRichValue(value: string) {
        console.log(value);
    }
}
@view('/form/rich')
class FieldRichView extends BlockView<FieldRich>{
    render() {
        var self = this;
        function keydown(event: React.KeyboardEvent<HTMLInputElement>) {
            if (event.key == 'Enter') {
                self.block.onChange((event.target as HTMLInputElement).value);
            }
        }
        return <FieldView block={this.block}>
            <RichView onInput={e => this.block.onInputRichValue(e)} value={this.block.value} ></RichView>
        </FieldView>
    }
}