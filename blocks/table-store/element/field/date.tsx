import React from "react";
import { useDatePicker } from "../../../../extensions/date";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/point";
import { OriginField } from "./origin.field";
import dayjs from "dayjs";
import { BlockRenderRange } from "../../../../src/block/enum";
@url('/field/date')
export class FieldDate extends OriginField {
    get dateString() {
        var r = dayjs(this.value);
        return r.format('YYYY-MM-DD')
    }
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {
        event.stopPropagation();
        var el = event.target as HTMLElement;
        var pickDate = await useDatePicker({ roundArea: Rect.from(el.getBoundingClientRect()) }, this.value);
        if (pickDate) {
            this.onUpdateProps({ value: pickDate },BlockRenderRange.self);
        }
    }
}
@view('/field/date')
export class FieldTextView extends BlockView<FieldDate>{
    render() {
        return <div className='sy-field-text'>{this.block.dateString}</div>
    }
}