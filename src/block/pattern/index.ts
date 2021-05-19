import { util } from "../../util/util";
import { Block } from "..";
import { BlockStyleCss } from "./style";
import { CssSelectorType } from "./type";
import { BlockCss, BlockCssName } from "./css";
import { OperatorDirective } from "../../history/declare";

export class Pattern {
    block: Block;
    id: string;
    date: number;
    styles: BlockStyleCss[] = [];
    constructor(block: Block) {
        this.block = block;
        this.id = util.guid();
        this.date = Date.now();
    }
    async load(options: Record<string, any>) {
        for (var op in options) {
            if (op == 'styles') continue;
            this[op] = options[op];
        }
        if (Array.isArray(options.styles)) {
            options.styles.each(sty => {
                var style = new BlockStyleCss(sty, this);
                this.styles.remove(x => x.name == style.name && x.selector == style.selector);
                this.styles.push(style);
            })
        }
        if (typeof this.id == 'undefined') {
            this.id = util.guid();
            this.date = new Date().getTime();
        }
    }
    async get() {
        if (this.styles.length == 0) return {};
        return {
            id: this.id,
            date: this.date,
            styles: this.styles.map(s => s.get())
        }
    }
    async cloneData() {
        return {
            styles: this.styles.map(s => s.cloneData())
        }
    }
    declare<T extends BlockCss>(name: string,
        selector: CssSelectorType,
        css: Partial<T>) {
        var style = this.styles.find(x => x.selector == selector && name == x.name);
        if (!style) {
            style = new BlockStyleCss({ name, selector, cssList: [css] }, this);
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
    setStyle(cssName: BlockCssName, style: Record<string, any>) {
        var name = this.block.patternState;
        var st = this.styles.find(x => x.name == name);
        if (st) {
            var old = st.get();
            st.merge(BlockCss.createBlockCss(Object.assign({ cssName }, style)));
            this.block.page.snapshoot.record(OperatorDirective.mergeStyle, {
                blockId: this.block.id,
                styleId: st.id,
                old,
                new: st.get()
            })
        }
        else {
            var sty = new BlockStyleCss({ name: name, cssList: [Object.assign({ cssName }, style)] }, this);
            this.styles.push(sty);
            this.block.page.snapshoot.record(OperatorDirective.insertStyle, {
                blockId: this.block.id,
                at: this.styles.length - 1,
                data: sty.get()
            })
        }
        this.block.page.onAddUpdate(this.block);
    }
}
