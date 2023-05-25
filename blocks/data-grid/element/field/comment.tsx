
import React from "react";
import { useCommentListView } from "../../../../extensions/comment/list";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
import lodash from "lodash";

@url('/field/comment')
export class FieldComment extends OriginField {
    async onOpenComment(event: React.MouseEvent) {
        var r = await useCommentListView({
            userid: this.page.user.id,
            elementUrl: getElementUrl(ElementType.SchemaData,
                this.dataGrid.schema.id,
                this.item.dataRow.id),
            sort: 'default'
        });
        if (r != 0 && typeof r == 'number') {
            var v = this.value;
            if (typeof v == 'object' && typeof v.count == 'number') {
                v.count = v.count + r;
            }
            else v = { count: r, users: [this.page.user] };
            this.value = v;
            this.forceUpdate();
        }
    }

}
@view('/field/comment')
export class FieldCommentView extends BlockView<FieldComment>{
    render() {
        var v = this.block.value;
        if (typeof v == 'object' && typeof v?.count == 'number') v = v.count;
        if (lodash.isNull(v) || lodash.isUndefined(v)) v = 0;
        var countStr = v > 0 ? `(${v})` : '';
        return <div className='sy-field-text'>
            <span onMouseDown={e => this.block.onOpenComment(e)} className="flex-center flex-inline f-14 text-1 padding-w-5 h-30 round-16 item-hover">评论<em>{countStr}</em></span>
        </div>
    }
}