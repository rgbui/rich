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
            var r = await self.block.item.onUpdateCellInteractive(self.block.viewField.field)
            if (r) {
                self.block.value = r;
                self.forceUpdate()
            }
            // var r = await channel.patch('/interactive/emoji', {
            //     elementUrl: getElementUrl(
            //         self.block.viewField.field.type == FieldType.emoji ? ElementType.SchemaFieldData : ElementType.SchemaFieldNameData,
            //         self.block.dataGrid.schema.id,
            //         self.block.viewField.field.type == FieldType.emoji ? self.block.field.id : self.block.field.name,
            //         self.block.item.dataRow.id
            //     ),
            //     fieldName: self.block.field.name
            // });
            // if (r.ok) {
            //     var ov = lodash.cloneDeep(self.block.value);
            //     if (typeof ov == 'undefined') ov = { count: 0 };
            //     if (typeof ov == 'number') ov = { count: ov };
            //     ov.count = r.data.count;
            //     var userid = self.block.page.user?.id;
            //     if (userid) {
            //         if (!Array.isArray(ov.users)) {
            //             ov.users = []
            //         }
            //         if (r.data.exists) {
            //             var ops = self.block.dataGrid.userEmojis[self.block.viewField.field.name];
            //             if (!Array.isArray(ops)) self.block.dataGrid.userEmojis[self.block.viewField.field.name] = ops = []
            //             if (!ops.exists(c => c == self.block.item.dataRow.id)) ops.push(self.block.item.dataRow.id);
            //             if (!ov.users.exists(g => g == userid)) ov.users.push(userid)
            //         }
            //         else {
            //             var ops = self.block.dataGrid.userEmojis[self.block.viewField.field.name];
            //             if (!Array.isArray(ops)) self.block.dataGrid.userEmojis[self.block.viewField.field.name] = ops = []
            //             if (ops.exists(c => c == self.block.item.dataRow.id)) lodash.remove(ops, c => c == self.block.item.dataRow.id);
            //             lodash.remove(ov.users, g => (g as any) == userid);
            //         }
            //         if (typeof r.data.otherCount == 'number') {
            //             var name = self.block.field.name == 'like' ? FieldType[FieldType.oppose] : FieldType[FieldType.like];
            //             self.block.item.dataRow[name] = r.data.otherCount;
            //             var cs = self.block.item.childs.findAll(g => (g instanceof OriginField) && g.field?.name == name);
            //             if (!r.data.otherExists) {
            //                 var ops = self.block.dataGrid.userEmojis[name];
            //                 if (!Array.isArray(ops)) self.block.dataGrid.userEmojis[name] = ops = []
            //                 if (ops.exists(c => c == self.block.item.dataRow.id)) lodash.remove(ops, c => c == self.block.item.dataRow.id);
            //             }
            //             if (cs.length > 0) {
            //                 for (var i = 0; i < cs.length; i++) {
            //                     (cs[i] as any).value = r.data.otherCount;
            //                     cs[i].forceUpdate();
            //                 }
            //             }
            //         }
            //     }
            //     self.block.value = ov;
            //     self.block.item.dataRow[self.block.field.name] = ov;
            //     self.forceUpdate();
            // }
        }
        var svg = GetFieldTypeSvg(this.block.viewField.field.type);
        var v = this.block.value;
        if (typeof v == 'object' && typeof v.count == 'number') v = v.count;
        var countStr = v > 0 ? `${v}` : '';
        var sp = <></>;
        if (this.block.viewField.field.type == FieldType.love) {
            var isOp =self.block.dataGrid.isEmoji(this.block.viewField.field,self.block.item.dataRow.id); 
            sp = <span className="cursor flex flex-inline h-24 f-14 text-1 padding-w-5 round-32  item-hover ">
                <Icon className={'gap-r-3'} size={16} icon={svg}></Icon>{isOp ? "取消喜欢" : "喜欢"}</span>
        }
        else if (this.block.viewField.field.type == FieldType.like) {
            var isOp = self.block.dataGrid.isEmoji(this.block.viewField.field,self.block.item.dataRow.id); 
            sp = <span className={"cursor f-12 flex flex-inline h-24 padding-w-5 round-32 " + (isOp ? " border-primary bg-primary text-white" : " text-1 item-hover border")}>
                <Icon className={'gap-r-3'} size={16} icon={svg}></Icon>{countStr}</span>
        } else if (this.block.viewField.field.type == FieldType.oppose) {
            var isOp = self.block.dataGrid.isEmoji(this.block.viewField.field,self.block.item.dataRow.id); 
            sp = <span className={"cursor f-12 flex flex-inline h-24 padding-w-5 round-32 " + (isOp ? " border-primary bg-primary text-white" : " text-1 item-hover border")}>
                <Icon className={'gap-r-3'} size={16} icon={svg}></Icon>{countStr}</span>
        } else {
            sp = <span className="flex flex-inline h-24 padding-w-5 round-32 border item-hover ">
                <em className={'gap-r-3 ef'} >{this.block.viewField.field.type == FieldType.emoji && this.block.viewField?.field.config?.emoji?.code}</em>
                {countStr}</span>
        }
        return <div onMouseDown={e => mousedown(e)}>
            {sp}
        </div>
    }
}