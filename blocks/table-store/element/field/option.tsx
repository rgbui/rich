import React from "react";
import { useTableStoreOption } from "../../../../extensions/tablestore/option";
import { BlockRenderRange } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/point";
import { FieldConfig } from "../../schema/field";
import { OriginField } from "./origin.field";
import "./style.less";
@url('/field/option')
export class FieldOption extends OriginField {
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {
        var fc: FieldConfig = this.schemaField.config;
        var op = await useTableStoreOption({
            roundArea: Rect.fromEle(event.target as HTMLElement)
        }, this.value,
            {
                multiple: false,
                options: fc?.options || [],
                changeOptions: (ops) => {
                    this.onUpdateCellFieldSchema({ config: { options: ops } })
                }
            }
        );
        if (op != null && typeof op != 'undefined') {
            this.onUpdateProps({ value: op }, BlockRenderRange.self);
        }
    }
}
@view('/field/option')
export class FieldTextView extends BlockView<FieldOption>{
    render() {
        var fc: FieldConfig = this.block.schemaField.config;
        var op = fc?.options ? fc.options.find(g => g.text == this.block.value) : undefined;

        return <div className='sy-field-text' style={{ display: 'block' }} >
            <span style={{ backgroundColor: op?.color }}>{this.block.value}</span>
        </div>
    }
}