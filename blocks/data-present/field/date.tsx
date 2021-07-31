import React from "react";
import { useDatePicker } from "../../../extensions/date";
import { url, view } from "../../../src/block/factory/observable";
import { TextArea } from "../../../src/block/partial/appear";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/point";
import { OriginField } from "./origin.field";
@url('/field/date')
export class FieldDate extends OriginField {

}
@view('/field/date')
export class FieldTextView extends BlockView<FieldDate>{
    async mousedown(e: React.MouseEvent) {
        var el = e.target as HTMLElement;
        var date = this.block.content;
        var pickDate = await useDatePicker(
            { roundArea: Rect.from(el.getBoundingClientRect()) },
            new Date()
        );
        if (this.block.parent) {
            var pa = this.block.parent as any;
            if (typeof pa.onUpdateCellValue == 'function') {
                await pa.onUpdateCellValue(pickDate);
            }
        }
    }
    render() {
        return <div className='sy-field-text' onMouseDown={e => this.mousedown(e)}><TextArea html={this.block.htmlContent}></TextArea></div>
    }
}