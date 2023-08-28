import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { OriginField, OriginFileView } from "./origin.field";
import { lst } from "../../../../i18n/store";
import { BlockUrlConstant } from "../../../../src/block/constant";

@url('/field/phone')
export class FieldPhone extends OriginField {
    onCellMousedown(event: React.MouseEvent<Element, MouseEvent>): void {
        var isDataGridTable = [BlockUrlConstant.DataGridTable].includes(this.dataGrid.url as any);
        if (!isDataGridTable) {
            setTimeout(() => {
                this.page.kit.anchorCursor.onFocusBlockAnchor(this, { last: true })
            }, 200);
        }
    }
}
@view('/field/phone')
export class FieldPhoneView extends OriginFileView<FieldPhone>{
    renderFieldValue() {
        return <div className='sy-field-phone  f-14'  >
            <TextArea plain block={this.block} placeholder={lst("输入手机号")} ></TextArea>
        </div>
    }
}