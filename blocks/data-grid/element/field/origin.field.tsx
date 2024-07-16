import lodash from "lodash";
import React from "react";
import { Block } from "../../../../src/block";
import { AppearAnchor } from "../../../../src/block/appear";
import { BlockDisplay } from "../../../../src/block/enum";
import { ViewField } from "../../schema/view";
import { TableGridItem } from "../../view/item";
import { ShyAlert } from "../../../../component/lib/alert";
import { lst } from "../../../../i18n/store";
import { BlockView } from "../../../../src/block/view";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { TableStoreGallery } from "../../view/gallery";
import { GetFieldTypeSvg } from "../../schema/util";
import { Icon } from "../../../../component/view/icon";
import { ToolTip } from "../../../../component/view/tooltip";
import { FieldType } from "../../schema/type";

export class OriginField extends Block {
    display = BlockDisplay.block;
    value: any;
    get fieldValue() {
        return this.dataGridItem.dataRow[this.field?.name];
    }
    get isSupportTextStyle() {
        return false;
    }
    get isCanEmptyDelete() {
        return false
    }
    get isEnterCreateNewLine() {
        return false;
    }
    get handleBlock() {
        return this.parent;
    }
    async changeAppear(appear: AppearAnchor) {
        var text = lodash.get(this, appear.prop);
        await this.onUpdateCellValue(text);
    }
    async onOnlyUpdateValue(value: any) {
        await this.dataGridItem.onOnlyUpdateCellValue(this.viewField.field, value);
    }
    async onUpdateCellValue(value) {
        this.value = value;
        await this.dataGridItem.onUpdateCellValue(this.viewField.field, value);
    }
    async changeProps(oldProps: Record<string, any>, newProps: Record<string, any>) {
        if (newProps && Object.keys(newProps).length > 0) {
            if (typeof newProps['value'] != 'undefined') {
                await this.dataGridItem.onUpdateCellValue(this.viewField.field, newProps['value'])
            }
        }
    }
    async onUpdateCellFieldSchema(props: Record<string, any>) {
        await this.dataGridItem.onUpdateFieldSchema(this.viewField.field, props);
    }
    get dataGridItem() {
        return this.parent as TableGridItem
    }
    get dataGrid() {
        return this.dataGridItem.dataGrid;
    }
    viewFieldId: string;
    get viewField() {
        return this.dataGrid.fields.find(g => g.id == this.viewFieldId);
    }
    set viewField(viewField: ViewField) {
        this.viewFieldId = viewField.id;
    }
    get field() {
        if (this.viewField) return this.viewField.field;
    }
    onCellMousedown(event: React.MouseEvent) {

    }
    get isAllowDrop(): boolean {
        return false;
    }
    checkEdit() {
        if (!this.isCanEdit()) {
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
    isCanEdit() {
        return this.dataGrid?.isCanEditRow(this.dataGridItem.dataRow);
    }
    async initialedLoad() {
        this.value = this.fieldValue;
    }
}

export class OriginFileView<T extends OriginField> extends BlockView<T> {
    renderFieldValue() {
        return <></>
    }
    renderView() {
        if (!this.block.viewField) return <></>
        var isCard = [
            BlockUrlConstant.DataGridBoard,
            BlockUrlConstant.DataGridGallery].includes(this.block.dataGrid.url as any);
        if (isCard) {
            var card = (this.block.dataGrid as TableStoreGallery).cardConfig;
            var isTitle = this.block.url == BlockUrlConstant.FieldTitle;
            if (card?.showField == 'wrap' && !isTitle) {
                return <div onMouseDown={e => {
                    if (this.block.isCanEdit()) {
                        e.stopPropagation();
                    }
                    this.block.onCellMousedown(e)
                }}>
                    <div className="remark f-12 gap-t-5 flex">
                        <Icon className={'flex-fixed'} size={13} icon={GetFieldTypeSvg(this.block.viewField.field)}></Icon>
                        <span className="flex-auto text-overflow  gap-l-5">{this.block.viewField?.text}</span>
                    </div>
                    <div className="text-wrap ">{this.renderFieldValue()}</div>
                </div>
            }
            else if (card?.showField == 'nowrap' && !isTitle) {
                var classList: string[] = ['flex'];
                if (![FieldType.comment,
                FieldType.browse,
                FieldType.love,
                FieldType.like
                ].includes(this.block.field?.type)) {
                    classList.push('flex-top')
                }
                return <div onMouseDown={e => {
                    if (this.block.isCanEdit()) {
                        e.stopPropagation();
                    }
                    this.block.onCellMousedown(e)
                }} className={classList.join(' ')}>
                    <ToolTip overlay={this.block.viewField?.text}><div className="flex-fixed flex flex-end w-80  remark ">
                        <Icon className={'flex-fixed'} size={14} icon={GetFieldTypeSvg(this.block.viewField.field)}></Icon>
                        <span className="text-overflow max-w-60 f-14 gap-l-3  flex-fixed"> {this.block.viewField?.text}</span>
                    </div></ToolTip>
                    <div className="flex-auto  gap-l-10 gap-r-5  text-overflow ">
                        {this.renderFieldValue()}
                    </div>
                </div>
            }
        }
        return this.renderFieldValue();
    }
}