import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TextArea } from "../../../../src/block/view/appear";
import { OriginField } from "./origin.field";
import { lst } from "../../../../i18n/store";

@url('/field/phone')
export class FieldPhone extends OriginField {

}
@view('/field/phone')
export class FieldPhoneView extends BlockView<FieldPhone>{
    renderView() {
        return <div className='sy-field-phone  f-14'  >
            <TextArea plain block={this.block} placeholder={lst("输入手机号")} ></TextArea>
        </div>
    }
}