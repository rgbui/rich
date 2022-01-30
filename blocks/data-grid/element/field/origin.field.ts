import React from "react";
import { Block } from "../../../../src/block";
import { BlockDisplay } from "../../../../src/block/enum";
import { ViewField } from "../../schema/view";
import { TableStoreItem } from "../../view/item";

export class OriginField extends Block {
    display = BlockDisplay.block;
    value: any;
    get isSupportTextStyle() {
        return false;
    }
    get handleBlock(): Block {
        return this.parent;
    }
    async changeProps(oldProps: Record<string, any>, newProps: Record<string, any>) {
        if (newProps && Object.keys(newProps).length > 0) {
            if (typeof newProps['value'] != 'undefined') {
                await this.item.onUpdateCellValue(this.viewField, newProps['value'])
            }
        }
    }
    async onUpdateCellFieldSchema(props: Record<string, any>) {
        this.item.onUpdateFieldSchema(this.viewField, props);
    }
    get item() {
        return this.parent as TableStoreItem
    }
    viewField: ViewField;
    get field() {
        if (this.viewField) return this.viewField.field;
    }
    onCellMousedown(event: React.MouseEvent) {

    }
}