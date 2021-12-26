import React from "react";
import { useDatePicker } from "../../../../extensions/date";
import { useTableStoreOption } from "../../../../extensions/tablestore/option";
import { BlockRenderRange } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/point";
import { FieldConfig } from "../../schema/field";
import { OriginFormField } from "./origin.field";
import { FieldView } from "./view";

@url('/form/option')
class FieldText extends OriginFormField {

}
@view('/form/option')
class FieldTextView extends BlockView<FieldText>{
    async mousedown(event: React.MouseEvent) {
        var fc: FieldConfig = this.block.field.config;
        var op = await useTableStoreOption({
            roundArea: Rect.fromEle(event.target as HTMLElement)
        }, this.block.value,
            {
                multiple: false,
                options: fc?.options || [],
                changeOptions: (ops) => {
                    // this.onUpdateCellFieldSchema({ config: { options: ops } })
                }
            }
        );
        if (op != null && typeof op != 'undefined') {
            this.block.onChange(op);
        }
    }
    render() {
        return <FieldView text={this.block.field.text}>
            <div className="sy-form-field-option-value" onMouseDown={e => this.mousedown(e)}>{this.block.value}</div>
        </FieldView>
    }
}