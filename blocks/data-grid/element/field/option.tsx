import React from "react";
import { useTableStoreOption } from "../../../../extensions/data-grid/option/option";
import { BlockRenderRange } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import { Rect } from "../../../../src/common/vector/point";
import { FieldConfig } from "../../schema/field";
import { OriginField, OriginFileView } from "./origin.field";
import { FieldType } from "../../schema/type";
import { util } from "../../../../util/util";
import "./style.less";

@url('/field/option')
export class FieldOption extends OriginField {
    async onCellMousedown(event: React.MouseEvent<Element, MouseEvent>) {
      
        if (this.checkEdit() === false) return;
        event.stopPropagation();
        var el = this.el.querySelector('.sy-field-option') as HTMLElement;
        if (!el) el = this.el;
        var rect = Rect.fromEle(el);
        var fn = async () => {
            var fc: FieldConfig = this.field.config || {};
            var op = await useTableStoreOption({
                dist: 0,
                roundArea: rect
            }, this.value,
                {
                    isEdit: this.isCanEdit(),
                    multiple: this.field.type == FieldType.options || fc?.isMultiple ? true : false,
                    options: fc?.options || [],
                    changeOptions: async (ops) => {
                        await this.onUpdateCellFieldSchema({ config: { options: ops } })
                        this.dataGrid.forceManualUpdate(false, true)
                    }
                }
            );
            if (typeof op != 'undefined') {
                await this.onUpdateProps({ value: op ? op.map(o => o.value) : [] }, { range: BlockRenderRange.self });
            }
        }
        if (this.dataGrid) await this.dataGrid.onDataGridTool(fn)
        else await fn()
    }
    get isFieldEmpty() {
        return !this.value || (Array.isArray(this.value) && this.value.length == 0)
    
    }
}
@view('/field/option')
export class FieldTextView extends OriginFileView<FieldOption> {
    renderFieldValue() {
        if (!this.block.field) return <></>
        var fc: FieldConfig = this.block.field.config;
        var vs = util.covertToArray(this.block.value);
        var ops = fc?.options ? fc.options.filter(g => vs.includes(g.value)) : undefined;
        if (!Array.isArray(ops)) ops = [];
        return <div className='sy-field-option flex  flex-wrap' >
            {ops.map(op => {
                return <span key={op.value} className="text-overflow  f-14 padding-h-2  l-16 " style={{ backgroundColor: op?.fill || op?.color, color: op.textColor }}>{op?.text || <i>&nbsp;</i>}</span>
            })}
        </div>
    }
}