
import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/comment')
export class FieldComment extends OriginField {

}
@view('/field/comment')
export class FieldCommentView extends BlockView<FieldComment>{
    render() {
        return <div className='sy-field-text'>

        </div>
    }
}