import { util } from "../../util/util";
import { Block } from "..";
import { BlockStyleCss } from "./style";
import { CssSelectorType } from "./type";
import { BlockCss } from "./css";

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
                this.styles.remove(x => x.name == style.name && x.selector == style.selector);
                this.styles.push(style);
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
    declare<T extends BlockCss>(name: string,
        selector: CssSelectorType,
        css: Partial<T>) {
        var style = this.styles.find(x => x.selector == selector && name == x.name);
        if (!style) {
            style = new BlockStyleCss({ name, selector, cssList: [css] });
            this.styles.push(style);
        }
        else {
            var cs = BlockCss.createBlockCss(css);
            style.merge(cs);
        }
    }
    get style() {
        var name = this.block.patternState;
        var st = this.styles.find(x => x.name == name);
        if (st) {
            return st.style;
        }
        else return {}
    }
}
