import React from "react";
import { Block } from "../../../../src/block";
import { BlockDisplay } from "../../../../src/block/enum";
import { FieldType } from "../../schema/type";
import { TableStoreCell } from "../../view/table/part/cell";
export class OriginField extends Block {
    fieldType: FieldType;
    display = BlockDisplay.block;
    value: any;
    get isSupportTextStyle() {
        return false;
    }
    get handleBlock(): Block {
        return this.parent.parent;
    }
    async changeProps(oldProps: Record<string, any>, newProps: Record<string, any>) {
        if (newProps && Object.keys(newProps).length > 0) {
            if (typeof newProps['value'] != 'undefined') {
                var cell = this.closest(x => x instanceof TableStoreCell) as TableStoreCell;
                if (cell) {
                    await cell.onUpdateCellValue(newProps['value']);
                }
            }
        }
    }
    async onUpdateCellFieldSchema(props: Record<string, any>) {
        var cell = this.closest(x => x instanceof TableStoreCell) as TableStoreCell;
        if (cell) {
            await cell.onUpdateCellFieldSchema(props);
        }
    }
    get field() {
        var cell = this.closest(x => x instanceof TableStoreCell) as TableStoreCell;
        if (cell) {
            return cell.field;
        }
    }
    onCellMousedown(event: React.MouseEvent) {

    }
}