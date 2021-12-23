import React from "react";
import { useTableStoreOption } from "../../../../extensions/tablestore/option";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/point";
import { OriginField } from "./origin.field";

@url('/field/option')
export class FieldOption extends OriginField {

}
@view('/field/option')
export class FieldTextView extends BlockView<FieldOption>{
    async mousedown(event: React.MouseEvent) {
        var op = useTableStoreOption({
            roundArea: Rect.fromEle(event.target as HTMLElement)
        },
            this.block.value,
            { multiple: false, options: [] }
        );
        if (op) {
            this.block.value = op;
        }
    }
    render() {
        return <div className='sy-field-text' onMouseDown={e => this.mousedown(e)}>
            <span>{this.block.value}</span>
        </div>
    }
}