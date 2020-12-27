import { util } from "../../../util/util";

import { Block } from "./block";
import { Prop } from "./prop";

export class Mode {
    props: Prop[] = [];
    block: Block;
    id: string;
    constructor(modeInfo: Record<string, any>, block: Block) {
        this.block = block;
        if (typeof modeInfo != 'object') {
            modeInfo = {
                id: util.guid()
            }
        }
        for (let m in modeInfo) {
            if (m == 'props') continue;
            else this[m] = modeInfo[m];
        }
        if (Array.isArray(modeInfo.props)) {
            this.props = [];
            modeInfo.props.each(pro => {
                var pr = new Prop(pro, this);
                this.props.push(pr);
            })
        }
    }
}