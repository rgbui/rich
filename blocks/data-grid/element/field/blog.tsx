import React from "react";
import { channel } from "../../../../net/channel";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Page } from "../../../../src/page";
import { OriginField } from "./origin.field";

@url('/field/blog')
export class FieldBlog extends OriginField {
    onCellMousedown(event: React.MouseEvent) {
        this.mousedown(event);
    }
    async mousedown(event: React.MouseEvent) {
        event.stopPropagation()
        var self = this;
        var elementUrl = getElementUrl(ElementType.SchemaFieldBlogData,
            self.dataGrid.schema.id,
            self.field.id,
            self.item.dataRow.id
        )
        var dialougPage: Page = await channel.air('/page/dialog', {
            elementUrl
        });
        if (dialougPage.pageInfo) {
            var data = dialougPage.pageInfo.getItem();
            self.value = data;
            this.onUpdateCellValue(this.value);
            this.forceUpdate();
        }
        var dialougPage: Page = await channel.air('/page/dialog', {
            elementUrl: null
        });
    }
}
@view('/field/blog')
export class FieldBlogView extends BlockView<FieldBlog>{
    render() {
        return <div className='sy-field-blog' >
            {this.block.value && <span className="link f-14 underline cursor">{this.block.value.text}</span>}
        </div>
    }
}