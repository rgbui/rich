import React from "react";
import { useTableStoreOption } from "../../../../extensions/tablestore/option/option";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldConfig } from "../../schema/field";
import { FieldView, OriginFormField } from "./origin.field";

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
        if (typeof op != 'undefined') {
            this.block.onChange(op);
        }
    }
    render() {
        var op = this.block.field?.config?.options?.find(g => g.value == this.block.value);
        return <FieldView block={this.block}>
            <div className="sy-form-field-option-value" onMouseDown={e => this.mousedown(e)}>{op?.text}</div>
        </FieldView>
    }
}