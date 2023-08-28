import React from "react";
import { url, view } from "../../../../src/block/factory/observable";

import { OriginField, OriginFileView } from "./origin.field";
import lodash from "lodash";
import { S } from "../../../../i18n/view";

@url('/field/browse')
export class FieldBrowse extends OriginField {

}
@view('/field/browse')
export class FieldBrowseView extends OriginFileView<FieldBrowse>{
    renderFieldValue() {
        var v = this.block.value;
        if (typeof v == 'object' && typeof v?.count == 'number') v = v.count;
        if (lodash.isNull(v) || lodash.isUndefined(v)) v = 0;
        var countStr = v > 0 ? `(${v})` : '';
        return <div className='sy-field-text f-14' >
            <span className="flex-center flex-inline text-1 padding-w-5 h-30 round-16 item-hover"><S>浏览</S><em>{countStr}</em></span>
        </div>
    }
}