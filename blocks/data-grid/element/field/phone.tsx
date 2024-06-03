import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { OriginField, OriginFileView } from "./origin.field";
import { lst } from "../../../../i18n/store";

@url('/field/phone')
export class FieldPhone extends OriginField {
    onCellMousedown(event: React.MouseEvent<Element, MouseEvent>): void {
        setTimeout(() => {
            this.page.kit.anchorCursor.onFocusBlockAnchor(this, { last: true })
        }, 50);
    }
    get isDisabledInputLine() {
        return true;
    }
}
@view('/field/phone')
export class FieldPhoneView extends OriginFileView<FieldPhone> {
    renderFieldValue() {
        return <div className='sy-field-phone  f-14'  >
            <TextArea plain block={this.block} prop='value' placeholder={lst("输入手机号")} ></TextArea>
        </div>
    }
}