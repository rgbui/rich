import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TextArea } from "../../../../src/block/view/appear";
import { OriginField } from "./origin.field";

@url('/field/email')
export class FieldEmail extends OriginField {

}
@view('/field/email')
export class FieldEmailView extends BlockView<FieldEmail>{
    render() {
        return <div className='sy-field-email'>
            <TextArea rf={e => this.block.elementAppear({ el: e, prop: 'value' })} placeholder="输入邮箱" html={this.block.value}></TextArea>
        </div>
    }
}