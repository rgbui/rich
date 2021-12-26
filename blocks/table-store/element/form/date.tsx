
import React from "react";
import { useDatePicker } from "../../../../extensions/date";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/point";
import { OriginFormField } from "./origin.field";
import { FieldView } from "./view";

@url('/form/date')
class FieldText extends OriginFormField {

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
        return <FieldView text={this.block.field.text}>
            <div className="sy-form-field-date-value" onMouseDown={e => this.mousedown(e)}>{this.block.value}</div>
        </FieldView>
    }
}