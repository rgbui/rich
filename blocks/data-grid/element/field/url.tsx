import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TextArea } from "../../../../src/block/view/appear";
import { OriginField } from "./origin.field";

@url('/field/url')
export class FieldUrl extends OriginField {

}
@view('/field/url')
export class FieldUrlView extends BlockView<FieldUrl>{
    render() {
        return <div className='sy-field-text'><TextArea rf={e => this.block.elementAppear({ el: e, prop: 'value' })} placeholder="输入网址" html={this.block.value}></TextArea></div>
    }
}