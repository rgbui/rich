import React from "react";
import { Icon } from "../../../../component/view/icon";
import { url, view } from "../../../../src/block/factory/observable";

import { FieldType } from "../../schema/type";
import { GetFieldTypeSvg } from "../../schema/util";
import { OriginField, OriginFileView } from "./origin.field";
import lodash from "lodash";

@url('/field/emoji')
export class FieldEmoji extends OriginField {

}

@view('/field/emoji')
export class FieldEmailView extends OriginFileView<FieldEmoji>{
    renderFieldValue() {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            if (self.block.checkSign() === false) return;
            var fn = async () => {
                var r = await self.block.item.onUpdateCellInteractive(self.block.viewField.field)
                if (r) {
                    self.block.value = r;
                    self.forceUpdate()
                }
            }
            if (self.block.dataGrid) await self.block.dataGrid.onDataGridTool(fn)
            else await fn()
        }
        var svg = GetFieldTypeSvg(this.block.viewField.field.type);
        var v = this.block.value;
        if (typeof v == 'object' && typeof v?.count == 'number') v = v.count;
        if (lodash.isNull(v) || lodash.isUndefined(v)) v = 0;
        var countStr = v > 0 ? `${v}` : '';
        var sp = <></>
        if (self.block.item.dataRow) {
            if (this.block.viewField.field.type == FieldType.love) {
                var isOp = self.block.dataGrid.isEmoji(this.block.viewField.field, self.block.item.dataRow.id);
                sp = <span className="cursor flex-center size-24  text-1  ">
                    <Icon className={(isOp ? " fill-primary" : " text-1")} size={18} icon={svg}></Icon></span>
            }
            else if (this.block.viewField.field.type == FieldType.vote) {
                var isOp = self.block.dataGrid.isEmoji(this.block.viewField.field, self.block.item.dataRow.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32  " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <Icon className={'gap-r-3'} size={18} icon={svg}></Icon>{countStr}</span>
            }
            else if (this.block.viewField.field.type == FieldType.like) {
                var isOp = self.block.dataGrid.isEmoji(this.block.viewField.field, self.block.item.dataRow.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32  " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <Icon className={'gap-r-3'} size={18} icon={svg}></Icon>{countStr}</span>

            } else if (this.block.viewField.field.type == FieldType.oppose) {
                var isOp = self.block.dataGrid.isEmoji(this.block.viewField.field, self.block.item.dataRow.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32  " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <Icon className={'gap-r-3'} size={18} icon={svg}></Icon>{countStr}</span>

            } else {
                var isOp = self.block.dataGrid.isEmoji(this.block.viewField.field, self.block.item.dataRow.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32  " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <em className={'gap-r-3 ef'} >{this.block.viewField.field.type == FieldType.emoji && this.block.viewField?.field.config?.emoji?.code}</em>
                    {countStr}</span>
            }
        }
        return <div onMouseDown={e => mousedown(e)}  >
            {sp}
        </div>
    }
}