import React from "react";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { OriginField } from "./origin.field";
@url('/field/check')
export class FieldCheck extends OriginField {
    changeValue(e) {

    }
}
@view('/field/check')
export class FieldCheckView extends BlockView<FieldCheck>{
    render() {
        return <div className='sy-field-text' onMouseDown={e => e.stopPropagation()}>
            <input type='checkbox' value={this.block.value} onChange={e => this.block.changeValue(e)} />
        </div>
    }
}