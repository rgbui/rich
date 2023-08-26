import React from "react";
import { useTableStoreOption } from "../../../../extensions/data-grid/option/option";
import { BlockRenderRange } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldConfig } from "../../schema/field";
import { OriginField } from "./origin.field";
import "./style.less";
import { FieldType } from "../../schema/type";
import { util } from "../../../../util/util";

@url('/field/option')
export class FieldOption extends OriginField {
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {
        event.stopPropagation();
        if (this.checkEdit() === false) return;
        var fc: FieldConfig = this.field.config || {};
        var op = await useTableStoreOption({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        }, this.value,
            {
                multiple: this.field.type == FieldType.options || fc.isMultiple ? true : false,
                options: fc?.options || [],
                changeOptions: async (ops) => {
                    await this.onUpdateCellFieldSchema({ config: { options: ops } })
                    this.dataGrid.forceUpdate()
                }
            }
        );
        if (op != null && typeof op != 'undefined') {
            this.onUpdateProps({ value: op.map(o => o.value) }, { range: BlockRenderRange.self });
        }
    }
}
@view('/field/option')
export class FieldTextView extends BlockView<FieldOption>{
    renderView() {
        var fc: FieldConfig = this.block.field.config;
        var vs = util.covertToArray(this.block.value);
        var ops = fc?.options ? fc.options.filter(g => vs.includes(g.value)) : undefined;
        if (!Array.isArray(ops)) ops = [];
        return <div className='sy-field-option flex  f-14' onMouseDown={e => this.block.onCellMousedown(e)}  >
            {ops.map(op => {
                return <span key={op.value} className="text-overflow" style={{ backgroundColor: op?.color }}>{op?.text || <i>&nbsp;</i>}</span>
            })}
        </div>
    }
}