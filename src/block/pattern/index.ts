import { util } from "../../util/util";
import { Block } from "..";
import { BlockStyleCss } from "./style";

export class Pattern {
    block: Block;
    id: string;
    date: number;
    styles: BlockStyleCss[] = [];
    constructor(block: Block) {
        this.block = block;
    }
    async load(options: Record<string, any>) {
        for (var op in options) {
            if (op == 'styles') continue;
            this[op] = options[op];
        }
        if (options.styles) {
            for (var n in options.styles) {
                var style = new BlockStyleCss(options.styles[n]);
                this.styles[n] = style;
            }
        }
        if (typeof this.id == 'undefined') {
            this.id = util.guid();
            this.date = new Date().getTime();
        }
    }
    async get() {
        return {
            id: this.id,
            date: this.date,
            styles: this.styles.map(s => s.get())
        }
    }
}
