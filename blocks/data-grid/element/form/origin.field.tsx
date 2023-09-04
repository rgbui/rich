import React from "react";
import { HideSvg, TrashSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { Block } from "../../../../src/block";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../../src/block/enum";
import { prop } from "../../../../src/block/factory/observable";
import { TextSpanArea } from "../../../../src/block/view/appear";
import { DataGridForm } from "../../view/form";
import { GetFieldTypeSvg } from "../../schema/util";
import { ShyAlert } from "../../../../component/lib/alert";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import "./style.less";

export class OriginFormField extends Block {
    display = BlockDisplay.block;
    value: any;
    get field() {
        if (this.page.schema) {
            return this.page.schema.fields.find(g => g.id == this.fieldId);
        }
        var c = this.closest(x => x.url == BlockUrlConstant.FormView) as DataGridForm;
        if (c?.schema) return c.schema.fields.find(g => g.id == this.fieldId);
    }
    get schema() {
        if (this.page.schema) return this.page.schema;
        else {
            var c = this.closest(x => x.url == BlockUrlConstant.FormView) as DataGridForm;
            if (c?.schema) return c.schema;
        }
    }
    @prop()
    fieldId: string;
    @prop()
    required: boolean = false;
    get isSupportTextStyle() {
        return false;
    }
    onInput(value: any) {
        this.value = value;
    }
    onChange(value: any) {
        this.value = value;
        this.view.forceUpdate();
    }
    @prop()
    allowRemark: boolean = false;
    @prop()
    fieldRemark: string = '';
    fieldError: string = '';
    async onGetContextMenus() {
        var items: MenuItem<BlockDirective | string>[] = [];
        if (this.page.isPageForm) {
            items.push({
                name: 'required',
                text: lst('必填'),
                type: MenuItemType.switch,
                checked: this.required,
                icon: { name: 'bytedance-icon', code: 'asterisk' }
            });
            items.push({
                name: 'allowRemark',
                text: lst('添加备注'),
                type: MenuItemType.switch,
                icon: { name: 'bytedance-icon', code: 'edit' },
                checked: this.allowRemark
            });
            items.push({
                type: MenuItemType.divide
            });
        }
        items.push({
            name: 'hide',
            icon: HideSvg,
            text: lst('隐藏')
        });
        return items;
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'required') {
            this.onUpdateProps({ [item?.name]: item.checked }, { range: BlockRenderRange.self });
        }
        else if (item?.name == 'allowRemark') {
            this.onUpdateProps({ [item?.name]: item.checked }, { range: BlockRenderRange.self });
        }
    }
    async onClickContextMenu(this: Block, item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        if (item) {
            switch (item.name) {
                case 'required':
                    //this.onUpdateProps({ required: item.checked });
                    break;
                case 'allowRemark':
                    //this.onUpdateProps({ allowRemark: item.checked });
                    break;
                case 'hide':
                    this.onDelete()
                    break;
            }
        }
    }
    checkEdit() {
        if (!this.isCanEdit()) {
            ShyAlert(lst('请先登录'))
            return false;
        }
        return true;
    }
    checkSign() {
        if (!this.page.isSign) {
            ShyAlert(lst('请先登录'))
            return false;
        }
        return true;
    }
    getVisibleHandleCursorPoint() {
        var point = super.getVisibleHandleCursorPoint();
        if (this.page.isPageForm) {
            point = point.move(0, -5);
        }
        else {
            point = point.move(0, 10);
        }
        return point;
    }
}
export function FieldView(props: { block: OriginFormField, children?: JSX.Element | string | React.ReactNode }) {
    var block = props.block;
    if (!block.page.isPageForm) {
        return <div className="sy-form-field-detail" style={block.visibleStyle}>
            <div className="gap-h-10 flex flex-top">
                <div className="flex-fixed  h-30 w-120 flex remark f-14 item-hover round gap-r-10 cursor">
                    <span className="flex-fixed size-20 flex-center  gap-l-5"><Icon size={14} icon={GetFieldTypeSvg(block.field.type)}></Icon></span>
                    <span className="flex-auto">{block.field.text}</span>
                </div>
                <div className="flex-auto  flex remark  min-h-30 item-hover round padding-w-10">
                    {props.children}
                </div>
            </div>
        </div>
    }
    return <div className='sy-form-field' onMouseDown={e => e.stopPropagation()}>
        <div className="gap-t-10 gap-b-30">
            {block.field && <div className="sy-form-field-box">
                <div className="flex gap-h-3">
                    <label className="b-500 f-16">{block.field.text}</label>
                    {block.required && <em className="text-primary f-12 round-4 gap-l-5 padding-w-5 "
                        style={{ backgroundColor: 'rgba(207,86,89,.16)' }}
                    ><S>必填</S></em>}
                </div>
                {block.allowRemark && <div className="sy-form-field-remark remark f-12 gap-h-3">
                    <TextSpanArea placeholderEmptyVisible={true} placeholder={lst("请输入说明介绍")} prop="fieldRemark" block={block} ></TextSpanArea>
                </div>}
                <div className="sy-form-field-control">{props.children}</div>
            </div>}
            {!block.field && <div onClick={e => props.block.onDelete()} className="sy-form-field-tip round padding-w-10 min-h-30 f-14 item-hover-focus flex">
                <span className="remark"><S>表单字段不存在</S></span>
                <a className="link flex cursor gap-l-10"><span className="size-24 flex-center"><Icon size={14} icon={TrashSvg}></Icon></span><span><S>移除</S></span></a>
            </div>}
            {block.fieldError && <div className="sy-form-field-error">{block.fieldError}</div>}
        </div>
    </div>
}