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
        return <div className='sy-field-phone'>
            <TextArea rf={e => this.block.elementAppear({ el: e, prop: 'value' })} placeholder="输入手机号" html={this.block.value}></TextArea>
        </div>
    }
}