import lodash from "lodash";
import React from "react";
import { Icon } from "../../../../component/view/icon";
import { channel } from "../../../../net/channel";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldType } from "../../schema/type";
import { GetFieldTypeSvg } from "../../schema/util";
import { OriginField } from "./origin.field";

@url('/field/emoji')
export class FieldEmoji extends OriginField {

}
@view('/field/emoji')
export class FieldEmailView extends BlockView<FieldEmoji>{
    render() {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            var r = await channel.patch('/interactive/emoji', {
                elementUrl: getElementUrl(
                    self.block.viewField.field.type == FieldType.emoji ? ElementType.SchemaFieldData : ElementType.SchemaFieldNameData,
                    self.block.dataGrid.schema.id,
                    self.block.viewField.field.type == FieldType.emoji ? self.block.field.id : self.block.field.name,
                    self.block.item.dataRow.id
                ),
                schemaUrl: self.block.dataGrid.schema.url,
                fieldName: self.block.field.name
            });
            if (r.ok) {
                var ov = lodash.cloneDeep(self.block.value);
                if (typeof ov == 'undefined') ov = {};
                if (typeof ov == 'number') ov = { count: ov }
                ov.count = r.data.count;
                var userid = self.block.page.user?.id;
                if (userid) {
                    if (!Array.isArray(ov.users)) {
                        ov.users = []
                    }
                    if (r.data.exists) {
                        if (!ov.users.exists(g => g == userid)) ov.users.push(userid)
                    }
                    else lodash.remove(ov.users, g => (g as any) == userid)
                }
                self.block.value = ov;
                self.block.item.dataRow[self.block.field.name] = ov;
                self.forceUpdate();
            }
        }
        var svg = GetFieldTypeSvg(this.block.viewField.field.type);
        var v = this.block.value;
        if (typeof v == 'object' && typeof v.count == 'number') v = v.count;
        var countStr = v > 0 ? `(${v})` : '';
        return <div onMouseDown={e => mousedown(e)}>
            {this.block.viewField.field.type != FieldType.emoji && <Icon size={16} icon={svg}></Icon>}
            {this.block.viewField.field.type == FieldType.emoji && this.block.viewField?.field.config?.emoji?.code}{countStr}
        </div>
    }
}