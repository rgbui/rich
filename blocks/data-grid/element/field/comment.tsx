
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
        var v = this.block.value;
        if (typeof v == 'object' && typeof v.count == 'number') v = v.count;
        var countStr = v > 0 ? `(${v})` : '';
        return <div className='sy-field-text'>
            <span className="flex-center flex-inline f-14 text-1 padding-w-5 h-30 round-16 item-hover">评论<em>{countStr}</em></span>
        </div>
    }
}