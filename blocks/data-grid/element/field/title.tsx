import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
import { Button } from "../../../../component/view/button";
@url('/field/title')
export class FieldText extends OriginField {
    async openPage() {
        this.dataGrid.onOpenEditForm(this.item.dataRow.id);
    }
}
@view('/field/title')
export class FieldTextView extends BlockView<FieldText>{
    render() {
        return <div className='sy-field-title'>
            <TextArea block={this.block} prop='value' placeholder="输入文本" ></TextArea>
            <Button size="small" className='sy-field-title-button' ghost onClick={e => this.block.openPage()}>打开</Button>
        </div>
    }
}