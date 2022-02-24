import React from "react";
import { channel } from "../../../../net/channel";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
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
                    ElementType.SchemaRecordField,
                    self.block.dataGrid.schema.id,
                    self.block.field.id,
                    self.block.item.dataRow.id
                ),
                schemaUrl: self.block.dataGrid.schema.url,
                fieldName: self.block.field.name
            });
            if (r.ok) {
                self.block.value = r.data.count;
                self.block.item.dataRow[self.block.field.name] = r.data.count;
                self.forceUpdate();
            }
        }
        var countStr = typeof this.block.value == 'number' && this.block.value > 0 ? `(${this.block.value})` : '';
        return <div className='sy-field-email' onMouseDown={e => mousedown(e)}>
            {this.block.viewField?.field.config?.emoji?.code}{countStr}
        </div>
    }
}