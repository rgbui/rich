import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { FieldType } from "../schema/field.type";
export class OriginField extends Block {
    fieldType: FieldType;
    display = BlockDisplay.block;
    get isSupportTextStyle() {
        return false;
    }
    // async onInputStore(value: string, at: number, end: number, action?: () => Promise<void>) {
    //     if (this.parent) {
    //         var pa = this.parent as any;
    //         if (typeof pa.onUpdateCellValue == 'function') {
    //             await pa.onUpdateCellValue(this.content);
    //         }
    //     }
    //     if (typeof action == 'function') await action();
    // }
    // async onInputDeleteStore(value: string, start: number, end: number, action?: () => Promise<void>) {
    //     if (this.parent) {
    //         var pa = this.parent as any;
    //         if (typeof pa.onUpdateCellValue == 'function') {
    //             await pa.onUpdateCellValue(this.content);
    //         }
    //     }
    //     if (typeof action == 'function') await action();
    // }
}