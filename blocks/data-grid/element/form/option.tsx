import React from "react";
import { useTableStoreOption } from "../../../../extensions/data-grid/option/option";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { DataGridOptionType, FieldConfig } from "../../schema/field";
import { FieldView, OriginFormField } from "./origin.field";

@url('/form/option')
class FieldText extends OriginFormField {

}
@view('/form/option')
class FieldTextView extends BlockView<FieldText>{
    async mousedown(event: React.MouseEvent) {
        if (this.block.checkEdit() === false) return;
        var fc: FieldConfig = this.block.field.config;
        var op = await useTableStoreOption({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        }, this.block.value,
            {
                multiple: fc?.isMultiple ? true : false,
                options: fc?.options || [],
                isEdit: this.block.isCanEdit(),
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
        if (op !== null && typeof op != 'undefined') {
            this.block.onChange(op[0].value);
        }
    }
    renderView() {
        var fc: FieldConfig = this.block.field.config;
        var ops: DataGridOptionType[] = [];
        if (fc.isMultiple) {
            ops = this.block.field.config?.options?.filter(g => this.block.value?.includes(g.value))
        }
        else {
            ops = fc.options?.filter(g => g.value == this.block.value);
        }
        return <FieldView block={this.block}>
            <div className="sy-form-field-option-value flex" onMouseDown={e => this.mousedown(e)}>
                {ops.map(op => {
                    return <span key={op.value} className="gap-r-10 padding-w-5 round cursor" style={{ background: op.color }}>{op.text}</span>
                })}
            </div>
        </FieldView>
    }
}