import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { FieldType } from "../schema/field.type";
export class OriginField extends Block {
    fieldType: FieldType;
    display = BlockDisplay.block;
    get isSupportTextStyle() {
        return false;
    }
    get handleBlock(): Block {
        return this.parent.parent;
    }
}