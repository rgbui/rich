import React from "react";
import { useDatePicker } from "../../../../extensions/date";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/point";
import { OriginField } from "./origin.field";
import dayjs from "dayjs";
@url('/field/date')
export class FieldDate extends OriginField {
    get dateString() {
        var r = dayjs(this.value);
        return r.format('YYYY-MM-DD')
    }
}
@view('/field/date')
export class FieldTextView extends BlockView<FieldDate>{
    async mousedown(e: React.MouseEvent) {
        e.stopPropagation();
        var el = e.target as HTMLElement;
        var pickDate = await useDatePicker({ roundArea: Rect.from(el.getBoundingClientRect()) }, new Date());
        if (pickDate) {
            this.block.value = pickDate;
            this.forceUpdate();
        }
    }
    render() {
        return <div className='sy-field-text' onMouseDown={e => this.mousedown(e)}><TextArea rf={e => this.block.elementAppear({
            el: e,
            prop: 'value'
        })} html={this.block.dateString}></TextArea></div>
    }
}