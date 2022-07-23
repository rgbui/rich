import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/button')
export class FieldCheck extends OriginField {

}
@view('/field/button')
export class FieldCheckView extends BlockView<FieldCheck>{
    render() {
        return <div className='sy-field-button' onMouseDown={e => e.stopPropagation()}>
            <a>编辑</a><a>删除</a>
        </div>
    }
}