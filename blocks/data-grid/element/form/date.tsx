
import dayjs from "dayjs";
import React from "react";
import { useDatePicker } from "../../../../extensions/date";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldView, OriginFormField } from "./origin.field";

@url('/form/date')
class FieldText extends OriginFormField {
    get dateString() {
        var v = this.value;
        if (!v) v = new Date();
        var r = dayjs(v);
        var fr = 'YYYY-MM-DD';
        if (this.field?.config?.includeTime) fr = 'YYYY-MM-DD HH:mm';
        return r.format(fr)
    }
}
@view('/form/date')
class FieldTextView extends BlockView<FieldText>{
    async mousedown(event: React.MouseEvent) {
        event.stopPropagation();
        var el = event.target as HTMLElement;
        var pickDate = await useDatePicker({ roundArea: Rect.from(el.getBoundingClientRect()) }, this.block.value);
        if (pickDate) {
            this.block.onChange(pickDate);
        }
    }
    render() {
        return <FieldView block={this.block}>
            <div className="sy-form-field-date-value" onMouseDown={e => this.mousedown(e)}>{this.block.dateString}</div>
        </FieldView>
    }
}