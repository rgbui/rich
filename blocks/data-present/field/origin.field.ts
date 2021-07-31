import { Block } from "../../../src/block";
import { BlockAppear, BlockDisplay } from "../../../src/block/enum";
import { FieldType } from "../schema/field.type";

export class OriginField extends Block {
    fieldType: FieldType;
    display = BlockDisplay.inline;
    appear = BlockAppear.text;
    get isSupportTextStyle() {
        return false;
    }
    async onInputText(value: string, at: number, end: number, action?: () => Promise<void>) {
        if (this.parent) {
            var pa = this.parent as any;
            if (typeof pa.onUpdateCellValue == 'function') {
                await pa.onUpdateCellValue(this.content);
            }
        }
        if (typeof action == 'function') await action();
    }
    async onDeleteText(value: string, start: number, end: number, action?: () => Promise<void>) {
        if (this.parent) {
            var pa = this.parent as any;
            if (typeof pa.onUpdateCellValue == 'function') {
                await pa.onUpdateCellValue(this.content);
            }
        }
        if (typeof action == 'function') await action();
    }
}