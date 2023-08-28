import React from "react";
import { url, view } from "../../../../src/block/factory/observable";

import { TextArea } from "../../../../src/block/view/appear";
import { OriginField, OriginFileView } from "./origin.field";
import { lst } from "../../../../i18n/store";
import { BlockUrlConstant } from "../../../../src/block/constant";

@url('/field/email')
export class FieldEmail extends OriginField {
    onCellMousedown(event: React.MouseEvent<Element, MouseEvent>): void {
        var isDataGridTable = [BlockUrlConstant.DataGridTable].includes(this.dataGrid.url as any);
        if (!isDataGridTable) {
            setTimeout(() => {
                this.page.kit.anchorCursor.onFocusBlockAnchor(this, { last: true })
            }, 200);
        }
    }
}
@view('/field/email')
export class FieldEmailView extends OriginFileView<FieldEmail>{
    renderFieldValue()  {
        return <div className='sy-field-email  f-14'  >
            <TextArea plain block={this.block} prop='value' placeholder={lst("输入邮箱")} ></TextArea>
        </div>
    }
}