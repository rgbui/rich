import React from "react";
import { useTableStoreOption } from "../../../../extensions/data-grid/option/option";
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
        if(this.block.checkEdit() === false) return;
        var fc: FieldConfig = this.block.field.config;
        var op = await useTableStoreOption({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        }, this.block.value,
            {
                multiple: fc?.isMultiple ? true : false,
                options: fc?.options || [],
                changeOptions: (ops) => {
                    this.block.schema.fieldUpdate({
                        fieldId: this.block.field.id,
                        data: {
                            config: { options: ops }
                        }
                    })
                }
            }
        );
        if (op != null && typeof op != 'undefined') {
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