import React from "react";
import { url, view } from "../../../../src/block/factory/observable";

import { OriginField, OriginFileView } from "./origin.field";
import { CheckBox } from "../../../../component/view/checkbox";

@url('/field/check')
export class FieldCheck extends OriginField {
    async changeValue(e: boolean) {
        if (this.checkEdit() === false) return;
        await this.onUpdateCellValue(e);
        this.forceManualUpdate();
    }
}
@view('/field/check')
export class FieldCheckView extends OriginFileView<FieldCheck> {
    renderFieldValue() {
        return <div className='sy-field-text' onMouseDown={e => e.stopPropagation()}>
            <CheckBox checked={this.block.value || false} onChange={e => { this.block.changeValue(e) }}></CheckBox>
        </div>
    }
}