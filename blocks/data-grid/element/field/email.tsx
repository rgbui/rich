import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TextArea } from "../../../../src/block/view/appear";
import { OriginField } from "./origin.field";
import { lst } from "../../../../i18n/store";

@url('/field/email')
export class FieldEmail extends OriginField {

}
@view('/field/email')
export class FieldEmailView extends BlockView<FieldEmail>{
    renderView()  {
        return <div className='sy-field-email f-14'>
            <TextArea plain block={this.block} prop='value' placeholder={lst("输入邮箱")} ></TextArea>
        </div>
    }
}