import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFormField, FieldView } from "./origin.field";
import { GetFieldTypeSvg } from "../../schema/util";
import { FieldType } from "../../schema/type";
import { Icon } from "../../../../component/view/icon";
import { Field } from "../../schema/field";
import lodash from "lodash";

@url('/form/emoji')
class FieldText extends OriginFormField {

}

@view('/form/emoji')
class FieldTextView extends BlockView<FieldText> {
    renderDetail() {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            if (self.block.checkEdit() === false) return;
            var r = await self.block.onUpdateCellInteractive(self.block.field)
            if (r) {
                self.block.onChange(r.data);
                if (self.block.field.name == 'vote') {
                    //这里不做任何处理，因为vote的数据是在其他地方处理的
                }
                else if (r.other) {
                    var name = self.block.field.name == 'like' ? FieldType[FieldType.oppose] : FieldType[FieldType.like];
                    var c = self.block.page.find(g => g instanceof OriginFormField && g.field.name == name) as OriginFormField;
                    if (c) {
                        c.onChange(r.other)
                    }
                }
            }
        }
        var svg = GetFieldTypeSvg(this.block.field);
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
                sp = <span className=" cursor flex-center size-24  text-1  round-8">
                    <Icon className={(isOp ? " fill-primary" : " text-1")} size={18} icon={svg}></Icon></span>
            }
            else if (this.block.field.type == FieldType.vote) {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32 " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <Icon className={'gap-r-3'} size={18} icon={svg}></Icon>{countStr}</span>
            }
            else if (this.block.field.type == FieldType.like) {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32 " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <Icon className={'gap-r-3'} size={18} icon={svg}></Icon>{countStr}</span>
            }
            else {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32  " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <em className={'gap-r-3 ef'} >{this.block.field.type == FieldType.emoji && (this.block?.field.config?.emoji?.code || "😀")}</em>
                    {countStr}</span>
            }
        }
        return <div className="min-h-30" onMouseDown={e => mousedown(e)}>
            {sp}
        </div>
    }

    renderForm() {
        
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            if (self.block.checkEdit() === false) return;
            var r = await self.block.onUpdateCellInteractive(self.block.field)
            if (r) {
                self.block.onChange(r.data);
                if (self.block.field.name == 'vote') {
                    //这里不做任何处理，因为vote的数据是在其他地方处理的
                }
                else if (r.other) {
                    var name = self.block.field.name == 'like' ? FieldType[FieldType.oppose] : FieldType[FieldType.like];
                    var c = self.block.page.find(g => g instanceof OriginFormField && g.field.name == name) as OriginFormField;
                    if (c) {
                        c.onChange(r.other)
                    }
                }
            }
        }
        var svg = GetFieldTypeSvg(this.block.field);
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
                sp = <span className=" cursor flex-center size-24  text-1  round-8">
                    <Icon className={(isOp ? " fill-primary" : " text-1")} size={18} icon={svg}></Icon></span>
            }
            else if (this.block.field.type == FieldType.vote) {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32 " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <Icon className={'gap-r-3'} size={18} icon={svg}></Icon>{countStr}</span>
            }
            else if (this.block.field.type == FieldType.like) {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32 " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <Icon className={'gap-r-3'} size={18} icon={svg}></Icon>{countStr}</span>
            }
            else {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32  " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <em className={'gap-r-3 ef'} >{this.block.field.type == FieldType.emoji && (this.block?.field.config?.emoji?.code || "😀")}</em>
                    {countStr}</span>
            }
        }
        return <div onMouseDown={e => mousedown(e)} className={"min-h-30  flex " + (this.block.fromType != 'doc-add' ? "padding-w-10 round item-hover-light" : "")}>
            {sp}
        </div>
    }
    renderField() {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            if (self.block.checkEdit() === false) return;
            var r = await self.block.onUpdateCellInteractive(self.block.field)
            if (r) {
                self.block.onChange(r.data);
                if (self.block.field.name == 'vote') {
                    //这里不做任何处理，因为vote的数据是在其他地方处理的
                }
                else if (r.other) {
                    var name = self.block.field.name == 'like' ? FieldType[FieldType.oppose] : FieldType[FieldType.like];
                    var c = self.block.page.find(g => g instanceof OriginFormField && g.field.name == name) as OriginFormField;
                    if (c) {
                        c.onChange(r.other)
                    }
                }
            }
        }
        var svg = GetFieldTypeSvg(this.block.field);
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
                sp = <span className=" cursor flex-center size-24  text-1  round-8">
                    <Icon className={(isOp ? " fill-primary" : " text-1")} size={18} icon={svg}></Icon></span>
            }
            else if (this.block.field.type == FieldType.vote) {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32 " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <Icon className={'gap-r-3'} size={18} icon={svg}></Icon>{countStr}</span>
            }
            else if (this.block.field.type == FieldType.like) {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32 " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <Icon className={'gap-r-3'} size={18} icon={svg}></Icon>{countStr}</span>
            }
            else {
                var isOp = isEmoji(this.block.field, self.block.page.formRowData.id);
                sp = <span className={"min-w-40 cursor f-14 flex-center flex-inline h-24 padding-w-5 round-32  " + (isOp ? "  bg-primary text-white" : " bg-p-light text-p")}>
                    <em className={'gap-r-3 ef'} >{this.block.field.type == FieldType.emoji && (this.block?.field.config?.emoji?.code || "😀")}</em>
                    {countStr}</span>
            }
        }
        return <div onMouseDown={e => mousedown(e)} className={"min-h-30  flex " + (this.block.fromType != 'doc-add' ? "padding-w-10 round item-hover-light" : "")}>
            {sp}
        </div>
    }
    renderView() {
        return <FieldView block={this.block}>
            {this.block.fromType == 'doc-detail' && this.renderDetail()}
            {this.block.fromType == 'doc-add' && this.renderForm()}
            {this.block.fromType == 'doc' && this.renderField()}
        </FieldView>
    }
}