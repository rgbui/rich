import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFormField, FieldView } from "./origin.field";
import { GetFieldTypeSvg } from "../../schema/util";
import lodash from "lodash";
import { FieldType } from "../../schema/type";
import { Icon } from "../../../../component/view/icon";
import { Field } from "../../schema/field";

@url('/form/emoji')
class FieldText extends OriginFormField {

}
@view('/form/emoji')
class FieldTextView extends BlockView<FieldText>{
    renderView() {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            if (self.block.checkSign() === false) return;
            var fn = async () => {
                var r = await self.block.onUpdateCellInteractive(self.block.field)
                if (r) {
                    self.block.value = r;
                    self.forceUpdate()
                }
            }
            await fn()
        }
        var svg = GetFieldTypeSvg(this.block.field.type);
        var v = this.block.value;
        if (typeof v == 'object' && typeof v?.count == 'number') v = v.count;
        if (lodash.isNull(v) || lodash.isUndefined(v)) v = 0;
        var countStr = v > 0 ? `${v}` : '';
        var sp = <></>
        var isEmoji = function (field: Field, rowId) {
            return self.block.page.formUserEmojis[field.name]?.includes(rowId)
        }
        if (self.block.page.formRowData) {
            if (this.block.field.type == FieldType.love) {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className="min-w-60 cursor flex-center size-24  text-1  round-8  item-hover ">
                    <Icon className={(isOp ? " fill-primary" : " text-1")} size={16} icon={svg}></Icon></span>
            }
            else if (this.block.field.type == FieldType.like) {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-60 cursor f-12 flex-center flex-inline h-24 padding-w-5 round-32 " + (isOp ? " border-primary bg-primary text-white" : " text-1 item-hover border")}>
                    <Icon className={'gap-r-3'} size={16} icon={svg}></Icon>{countStr}</span>
            } else if (this.block.field.type == FieldType.oppose) {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-60 cursor f-12 flex-center flex-inline h-24 padding-w-5 round-32 " + (isOp ? " border-primary bg-primary text-white" : " text-1 item-hover border")}>
                    <Icon className={'gap-r-3'} size={16} icon={svg}></Icon>{countStr}</span>
            } else {
                sp = <span className="min-w-60 flex-center flex-inline h-24 padding-w-5 round-32 border item-hover ">
                    <em className={'gap-r-3 ef'} >{this.block.field.type == FieldType.emoji && this.block?.field.config?.emoji?.code}</em>
                    {countStr}</span>
            }
        }
        return <FieldView block={this.block}>
            <div>
                <label onMouseDown={e => mousedown(e)}>{sp}</label>
            </div>
        </FieldView>
    }
}