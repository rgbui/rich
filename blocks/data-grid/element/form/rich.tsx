import lodash from "lodash";
import React from "react";
import { RichViewEditor } from "../../../../component/view/editor/view";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";

@url('/form/rich')
class FieldRich extends OriginFormField {
    onInputRichValue = lodash.debounce(async (value: string,pics,text) => {
        var self = this;
        self.onChange({ content: value,pics,text:text.slice(0,200) });
    }, 800)
}
@view('/form/rich')
class FieldRichView extends BlockView<FieldRich>{
    render() {
        return <FieldView block={this.block}>
            <RichViewEditor onChange={(e,pics,text) => this.block.onInputRichValue(e,pics,text)} html={this.block.value?.content}></RichViewEditor>
        </FieldView>
    }
}