import React from "react";
import { channel } from "../../../../net/channel";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Page } from "../../../../src/page";
import { OriginField } from "./origin.field";

@url('/field/blog')
export class FieldBlog extends OriginField {
    async mousedown(event: React.MouseEvent) {
        var self = this;
        var elementUrl = getElementUrl(ElementType.SchemaFieldBlogData,
            self.dataGrid.schema.id,
            self.field.id,
            self.item.dataRow.id
        )
        var dialougPage: Page = await channel.air('/page/dialog', {
            elementUrl
        })
        // var r = await channel.patch('/interactive/emoji',{
        //     elementUrl: getElementUrl(
        //         self.block.viewField.field.type == FieldType.emoji ? ElementType.SchemaFieldData : ElementType.SchemaFieldNameData,
        //         self.block.dataGrid.schema.id,
        //         self.block.viewField.field.type == FieldType.emoji ? self.block.field.id : self.block.field.name,
        //         self.block.item.dataRow.id
        //     ),
        //     schemaUrl: self.block.dataGrid.schema.url,
        //     fieldName: self.block.field.name
        // });
        // if (r.ok) {
        // var ov = lodash.cloneDeep(self.block.value);
        // if (typeof ov == 'undefined') ov = {};
        // if (typeof ov == 'number') ov = { count: ov }
        // ov.count = r.data.count;
        // var userid = self.block.page.user?.id;
        // if (userid) {
        //     if (!Array.isArray(ov.users)) {
        //         ov.users = []
        //     }
        //     if (r.data.exists) {
        //         if (!ov.users.exists(g => g == userid)) ov.users.push(userid)
        //     }
        //     else lodash.remove(ov.users, g => (g as any) == userid)
        // }
        // self.block.value = ov;
        // self.block.item.dataRow[self.block.field.name] = ov;
        // self.forceUpdate();
        // }
    }
}
@view('/field/blog')
export class FieldBlogView extends BlockView<FieldBlog>{
    render() {
        return <div className='sy-field-button' onMouseDown={e => { e.stopPropagation(); this.block.mousedown(e) }}>

        </div>
    }
}