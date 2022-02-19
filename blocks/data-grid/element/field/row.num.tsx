import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
@url('/field/row/num')
export class FieldRowNum extends OriginField {

}
@view('/field/row/num')
export class FieldRowNumView extends BlockView<FieldRowNum>{
    render() {
        return <div className='sy-field-row-num'>
            {this.block.item.dataIndex + 1}
        </div>
    }
}