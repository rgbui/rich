import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/check')
export class FieldCheck extends OriginField {
    async changeValue(e: React.ChangeEvent<HTMLInputElement>) {
        await this.onUpdateCellValue(e.target.checked);
        this.forceUpdate();
    }
}
@view('/field/check')
export class FieldCheckView extends BlockView<FieldCheck>{
    render() {
        return <div className='sy-field-text' onMouseDown={e => e.stopPropagation()}>
            <input type='checkbox' checked={this.block.value||false} onChange={e => this.block.changeValue(e)} />
        </div>
    }
}