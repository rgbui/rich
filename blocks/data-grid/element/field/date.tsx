import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { OriginField } from "./origin.field";
import dayjs from "dayjs";
import { BlockRenderRange } from "../../../../src/block/enum";
import { useDatePicker } from "../../../../extensions/date";

@url('/field/date')
export class FieldDate extends OriginField {
    get dateString() {
        if (this.value === null) return ''
        var r = dayjs(this.value);
        var format = this.field?.config?.dateFormat || 'YYYY年MM月DD日'
        return r.format(format)
    }
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {
        event.stopPropagation();
        var el = event.target as HTMLElement;
        var pickDate = await useDatePicker({ roundArea: Rect.from(el.getBoundingClientRect()) }, this.value, {
            includeTime: this.field?.config?.includeTime ? true : false
        });
        if (typeof pickDate != 'undefined') {
            this.onUpdateProps({ value: pickDate }, { range: BlockRenderRange.self });
        }
    }
}
@view('/field/date')
export class FieldTextView extends BlockView<FieldDate>{
    render() {
        return <div className='sy-field-date' style={{ width: '100%', minHeight: 30 }} onMouseDown={e => this.block.onCellMousedown(e)}>{this.block.dateString}</div>
    }
}