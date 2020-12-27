
import { util } from "../../../util/util";
import { Block } from "./block";
import { Mode } from "./mode";

export class Prop {
    name: string
    private val: any;
    mode?: Mode;
    block: Block;
    constructor(propInfo: Record<string, any>, parent: Block | Mode) {
        if (parent) {
            if (parent instanceof Block) {
                this.block = parent;
            }
            else if (parent instanceof Mode) {
                this.mode = parent;
                this.block = this.mode.block;
            }
        }
        if (typeof propInfo == 'object') {
            for (let pro in propInfo) {
                this[pro] = propInfo[pro];
            }
        }
    }
    get value() {
        return util.clone(this.val);
    }
    set value(val: any) {
        this.val = util.clone(val);
    }
}