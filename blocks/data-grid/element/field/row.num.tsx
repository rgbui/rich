import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { OriginField, OriginFileView } from "./origin.field";
@url('/field/row/num')
export class FieldRowNum extends OriginField {

}
@view('/field/row/num')
export class FieldRowNumView extends OriginFileView<FieldRowNum>{
    renderFieldValue() {
        return <div className='sy-field-row-num  f-14' >
            {this.block.item.dataIndex + 1}
        </div>
    }
}