
import React from "react";

import { ElementType, getElementUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { OriginField, OriginFileView } from "./origin.field";
import lodash from "lodash";
import { S } from "../../../../i18n/view";
import { useCommentListView } from "../../../../extensions/comment/dialoug";

@url('/field/comment')
export class FieldComment extends OriginField {
    async onOpenCommentView(event: React.MouseEvent) {
        if (this.isCanEdit() === false) return;
        var fn = async () => {
            var r = await useCommentListView(null, {
                ws: this.page.ws,
                userid: this.page.user.id,
                elementUrl: getElementUrl(ElementType.SchemaData,
                    this.dataGrid.schema.id,
                    this.dataGridItem.dataRow.id),
                displayFormat: this.value?.format ?? 'comment',
            });
            if (r != 0 && typeof r == 'number') {
                var v = this.value;
                if (!v) {
                    v = { count: 0, format: 'comment', users: [] }
                }
                if (typeof v == 'object' && typeof v.count == 'number') {
                    v.count = r;
                }
                else v = { count: r, format: 'comment', users: [this.page.user] };
                await this.onOnlyUpdateValue(v);
                this.forceManualUpdate();
            }
        }
        if (this.dataGrid) await this.dataGrid.onDataGridTool(fn)
        else await fn()
    }
}

@view('/field/comment')
export class FieldCommentView extends OriginFileView<FieldComment> {
    renderFieldValue() {
        var v = this.block.value;
        if (typeof v == 'object' && typeof v?.count == 'number') v = v.count;
        if (lodash.isNull(v) || lodash.isUndefined(v)) v = 0;
        var countStr = v > 0 ? `(${v})` : '';
        return <div className='sy-field-text  f-14' >
            <span onMouseDown={e => this.block.onOpenCommentView(e)} className="flex-center flex-inline  text-1 padding-w-5 h-30 round item-hover"><S>评论</S><em>{countStr}</em></span>
        </div>
    }
}