import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { OriginField, OriginFileView } from "./origin.field";

@url('/field/row/check')
export class FieldRowCheck extends OriginField {
    async onChange(event: React.ChangeEvent<HTMLInputElement>) {
        await this.dataGrid.onCheckRow(this.item.dataRow, event.target.checked);
        this.view.forceUpdate();
    }
}
@view('/field/row/check')
export class FieldRowCheckView extends OriginFileView<FieldRowCheck>{
    renderFieldValue()  {
        var checked = this.block.dataGrid.checkItems.some(s => s.id == this.block.item.dataRow.id);
        return <div className='sy-field-row-check'>
            <input type='checkbox'
                checked={checked}
                onChange={e => this.block.onChange(e)}
            />
        </div>
    }
}