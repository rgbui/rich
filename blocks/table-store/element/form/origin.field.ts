import { Block } from "../../../../src/block";
import { BlockDisplay } from "../../../../src/block/enum";
import { prop } from "../../../../src/block/factory/observable";
import { Field } from "../../schema/field";
export class OriginFormField extends Block {
    display = BlockDisplay.block;
    value: any;
    field: Field;
    @prop()
    fieldId: string;
    get isSupportTextStyle() {
        return false;
    }
    onInput(value:any){
        
    }
    onChange(value:any){

    }
}