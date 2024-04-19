import lodash from "lodash";
import React from "react";
import { Block } from "../../../../src/block";
import { AppearAnchor } from "../../../../src/block/appear";
import { BlockDisplay } from "../../../../src/block/enum";
import { ViewField } from "../../schema/view";
import { TableStoreItem } from "../../view/item";
import { ShyAlert } from "../../../../component/lib/alert";
import { lst } from "../../../../i18n/store";
import { BlockView } from "../../../../src/block/view";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { TableStoreGallery } from "../../view/gallery";
import { GetFieldTypeSvg } from "../../schema/util";
import { Icon } from "../../../../component/view/icon";

export class OriginField extends Block {
    display = BlockDisplay.block;
    value: any;
    get isSupportTextStyle() {
        return false;
    }
    get isCanEmptyDelete() {
        return false
    }
    get isEnterCreateNewLine() {
        return false;
    }
    get handleBlock(): Block {
        return this.parent;
    }
    async changeAppear(appear: AppearAnchor): Promise<void> {
        var text = lodash.get(this, appear.prop);
        await this.item.onUpdateCellValue(this.viewField.field, text);
    }
    async onUpdateCellValue(value) {
        this.value = value;
        await this.item.onUpdateCellValue(this.viewField.field, value);
    }
    async changeProps(oldProps: Record<string, any>, newProps: Record<string, any>) {
        if (newProps && Object.keys(newProps).length > 0) {
            if (typeof newProps['value'] != 'undefined') {
                await this.item.onUpdateCellValue(this.viewField.field, newProps['value'])
            }
        }
    }
    async onUpdateCellFieldSchema(props: Record<string, any>) {
        this.item.onUpdateFieldSchema(this.viewField, props);
    }
    get item() {
        return this.parent as TableStoreItem
    }
    get dataGrid() {
        return this.item.dataGrid;
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
                    e.stopPropagation();
                    this.block.onCellMousedown(e)
                }}>
                    <div className="remark f-12 gap-h-5 flex">
                        <Icon size={12} icon={GetFieldTypeSvg(this.block.viewField.field?.type)}></Icon>
                        <span>{this.block.viewField?.text}</span>
                    </div>
                    <div>{this.renderFieldValue()}</div>
                </div>
            }
            else if (card?.showField == 'nowrap' && !isTitle) {
                return <div onMouseDown={e => {
                    e.stopPropagation();
                    this.block.onCellMousedown(e)
                }} className="flex flex-top">
                    <div className="flex-fixed w-60 text-overflow  remark f-12 ">{this.block.viewField?.text}</div>
                    <div className="flex-auto">
                        {this.renderFieldValue()}
                    </div>
                </div>
            }
        }
        return this.renderFieldValue();
    }
}