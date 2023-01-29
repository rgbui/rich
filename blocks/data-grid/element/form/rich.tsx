import lodash from "lodash";
import React from "react";
import { RichView } from "../../../../component/view/rich";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";

@url('/form/rich')
class FieldRich extends OriginFormField {
    onInputRichValue = lodash.debounce(async (value: string) => {
        console.log(value);
        var self = this;
        self.onChange({ content: value });
    }, 800)
}
@view('/form/rich')
class FieldRichView extends BlockView<FieldRich>{
    render() {
        return <FieldView block={this.block}>
            <RichView onInput={e => this.block.onInputRichValue(e)} value={this.block.value?.content} ></RichView>
        </FieldView>
    }
}