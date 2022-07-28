import React from "react";
import { Avatar } from "../../../../component/view/avator/face";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
@url('/field/user')
export class FieldUser extends OriginField {

}
@view('/field/user')
export class FieldTextView extends BlockView<FieldUser>{
    render() {
        return <div className='sy-field-text'>
            {this.block.value && <Avatar userid={this.block.value}></Avatar>}
        </div>
    }
}