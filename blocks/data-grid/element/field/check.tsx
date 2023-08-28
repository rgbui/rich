import React from "react";
import { url, view } from "../../../../src/block/factory/observable";

import { OriginField, OriginFileView } from "./origin.field";

@url('/field/check')
export class FieldCheck extends OriginField {
    async changeValue(e: React.ChangeEvent<HTMLInputElement>) {
        if (this.checkEdit() === false) return;
        await this.onUpdateCellValue(e.target.checked);
        this.forceUpdate();
    }
}
@view('/field/check')
export class FieldCheckView extends OriginFileView<FieldCheck>{
    renderFieldValue() {
        return <div className='sy-field-text' onMouseDown={e => e.stopPropagation()}>
            <input type='checkbox' checked={this.block.value||false} onChange={e => this.block.changeValue(e)} />
        </div>
    }
}