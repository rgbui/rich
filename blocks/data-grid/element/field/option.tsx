import React from "react";
import { useTableStoreOption } from "../../../../extensions/tablestore/option/option";
import { BlockRenderRange } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldConfig } from "../../schema/field";
import { OriginField } from "./origin.field";
import "./style.less";
@url('/field/option')
export class FieldOption extends OriginField {
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {
        event.stopPropagation();
        var fc: FieldConfig = this.field.config;
        var op = await useTableStoreOption({
            roundArea: Rect.fromEle(event.target as HTMLElement)
        }, this.value,
            {
                multiple: false,
                options: fc?.options || [],
                changeOptions: async (ops) => {
                    await this.onUpdateCellFieldSchema({ config: { options: ops } })
                    this.dataGrid.forceUpdate()
                }
            }
        );
        if (op != null && typeof op != 'undefined') {
            this.onUpdateProps({ value: op }, { range: BlockRenderRange.self });
        }
    }
}
@view('/field/option')
export class FieldTextView extends BlockView<FieldOption>{
    render() {
        var fc: FieldConfig = this.block.field.config;
        var op = fc?.options ? fc.options.find(g => g.value == this.block.value) : undefined;
        return <div className='sy-field-option' onMouseDown={e => this.block.onCellMousedown(e)} style={{ display: 'block' }} >
            <span style={{ backgroundColor: op?.color }}>{op?.text || <i>&nbsp;</i>}</span>
        </div>
    }
}