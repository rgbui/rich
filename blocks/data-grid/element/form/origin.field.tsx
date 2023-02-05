import React from "react";
import { HideSvg, TrashSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { Block } from "../../../../src/block";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../../src/block/enum";
import { prop } from "../../../../src/block/factory/observable";
import { TextSpanArea } from "../../../../src/block/view/appear";
import { PageLayoutType } from "../../../../src/page/declare";
import { DataGridForm } from "../../view/form";
import "./style.less";

export class OriginFormField extends Block {
    display = BlockDisplay.block;
    value: any;
    get field() {
        if (this.page.pageLayout.type == PageLayoutType.dbForm && this.page.schema) {
            return this.page.schema.fields.find(g => g.id == this.fieldId);
        }
        var c = this.closest(x => x.url == BlockUrlConstant.FormView) as DataGridForm;
        if (c.schema) return c.schema.fields.find(g => g.id == this.fieldId);
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
        items.push({
            name: 'required',
            text: '必填',
            type: MenuItemType.switch,
            checked: this.required
        });
        items.push({
            name: 'allowRemark',
            text: '添加备注',
            type: MenuItemType.switch,
            checked: this.allowRemark
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: 'hide',
            icon: HideSvg,
            text: '隐藏',
            label: "hide"
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
}

export function FieldView(props: { block: OriginFormField, children?: JSX.Element | string | React.ReactNode }) {
    var block = props.block;
    return <div className='sy-form-field' onMouseDown={e => e.stopPropagation()}>
        {block.field && <div className="sy-form-field-box">
            <div className="flex">
                {/* <Icon icon={GetFieldTypeSvg(block.field.type)} size={16}></Icon> */}
                <label className="bold f-24">{block.field.text}</label>
                {block.required && <em className="bg-primary text-white f-12 round-4 gap-l-5 op-5">必填</em>}
            </div>
            {block.allowRemark && <div className="sy-form-field-remark remark f-14 gap-h-5">
                <TextSpanArea placeholderEmptyVisible={true} placeholder="请输入说明介绍" prop="fieldRemark" block={block} ></TextSpanArea>
            </div>}
            <div className="sy-form-field-control">{props.children}</div>
        </div>}
        {!block.field && <div onClick={e => props.block.onDelete()} className="sy-form-field-tip round padding-w-10 min-h-30 f-14 item-hover-focus flex">
            <span className="remark">表单字段不存在</span>
            <a className="link flex cursor gap-l-10"><span className="size-24 flex-center"><Icon size={14} icon={TrashSvg}></Icon></span><span>移除</span></a>
        </div>}
        {block.fieldError && <div className="sy-form-field-error">{block.fieldError}</div>}
    </div>
}