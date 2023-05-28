import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
import lodash from "lodash";

@url('/field/browse')
export class FieldBrowse extends OriginField {

}
@view('/field/browse')
export class FieldBrowseView extends BlockView<FieldBrowse>{
    render() {
        var v = this.block.value;
        console.log('gggg',v,this.block);
        if (typeof v == 'object' && typeof v?.count == 'number') v = v.count;
        if (lodash.isNull(v) || lodash.isUndefined(v)) v = 0;
        var countStr = v > 0 ? `(${v})` : '';
        return <div className='sy-field-text'>
            <span className="flex-center flex-inline f-14 text-1 padding-w-5 h-30 round-16 item-hover">浏览<em>{countStr}</em></span>
        </div>
    }
}