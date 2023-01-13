import lodash from "lodash";
import React from "react";
import { RichView } from "../../../../component/view/rich";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/rich')
export class FieldRich extends OriginField {
    onInputRichValue = lodash.debounce(async (value: string) => {
        console.log(value);
        await this.onUpdateCellValue({ content: value });
    },800)
}
@view('/field/rich')
export class FieldRichView extends BlockView<FieldRich>{
    render() {
        return <div className='sy-field-text f-14'>
            <RichView onInput={e => this.block.onInputRichValue(e)} value={this.block.value?.content} ></RichView>
        </div>
    }
}