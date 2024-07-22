import React from "react";
import { url, view } from "../../../../src/block/factory/observable";

import { Rect } from "../../../../src/common/vector/point";
import { OriginField, OriginFileView } from "./origin.field";
import dayjs from "dayjs";
import { BlockRenderRange } from "../../../../src/block/enum";
import { useDatePicker } from "../../../../extensions/date";
import { FieldType } from "../../schema/type";

@url('/field/date')
export class FieldDate extends OriginField {
    get dateString() {

        if (!(this.value instanceof Date)) return ''
        var r = dayjs(this.value);
        var format = this.field?.config?.dateFormat || 'YYYY年MM月DD日'
        return r.format(format)
    }
    get isFieldEmpty() {
        return !this.value
    }
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {
        if (this.checkEdit() === false) return;
        if (this.field?.type == FieldType.createDate || this.field?.type == FieldType.modifyDate) return;
        event.stopPropagation();
        var el = event.target as HTMLElement;
        var fn = async () => {
            var pickDate = await useDatePicker({ roundArea: Rect.from(el.getBoundingClientRect()) }, this.value, {
                includeTime: this.field?.config?.includeTime ? true : false
            });
            if (typeof pickDate != 'undefined') {
                await this.onUpdateProps({ value: pickDate }, { range: BlockRenderRange.self });
            }
        }
        if (this.dataGrid) await this.dataGrid.onDataGridTool(fn)
        else await fn()
    }
}
@view('/field/date')
export class FieldTextView extends OriginFileView<FieldDate> {
    renderFieldValue() {
        return <div className='sy-field-date  flex  f-14' style={{ width: '100%' }} onMouseDown={e => this.block.onCellMousedown(e)}>{this.block.dateString}</div>
    }
}