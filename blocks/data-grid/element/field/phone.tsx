import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TextArea } from "../../../../src/block/view/appear";
import { OriginField } from "./origin.field";

@url('/field/phone')
export class FieldPhone extends OriginField {

}
@view('/field/phone')
export class FieldPhoneView extends BlockView<FieldPhone>{
    render() {
        return <div className='sy-field-phone f-14'>
            <TextArea plain block={this.block} placeholder="输入手机号" ></TextArea>
        </div>
    }
}