import { util } from "../../../util/util";
import { Block } from "..";
import { BlockStyleCss } from "./style";
import { CssSelectorType } from "./type";
import { BlockCss, BlockCssName, BorderCss, FillCss, FilterCss, FontCss, RadiusCss, ShadowCss, SvgCss, TransformCss } from "./css";
import { OperatorDirective } from "../../history/declare";
import lodash from "lodash";

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
        var st = this.blockStyle;
        if (st) return st.style;
        else return {}
    }
    get blockStyle() {
        var name = this.block.patternState;
        var st = this.styles.find(x => x.name == name);
        return st;
    }
    async setStyle(cssName: BlockCssName, style: Record<string, any>) {
        var name = this.block.patternState;
        var st = this.styles.find(x => x.name == name);
        if (st) {
            var old = st.get();
            st.merge(BlockCss.createBlockCss(Object.assign({ cssName }, style)));
            if (this.block.page.snapshoot.canRecord && !lodash.isEqual(old, st.get())) {
                if (this.block.page.user) {
                    await this.block.updateProps({
                        editor: this.block.page.user.id,
                        editDate: Date.now()
                    })
                }
                this.block.page.snapshoot.record(OperatorDirective.$merge_style, {
                    pos: st.pos,
                    old_value: old,
                    new_value: st.get()
                }, this.block)
                this.block.page.notifyActionBlockUpdate(this.block);
            }
        }
        else {
            await this.createStyle({ name: name, cssList: [Object.assign({ cssName }, style)] });
        }
    }
    async updateStyle(styleId: string, styleData: Record<string, any>) {
        var style = this.styles.find(g => g.id == styleId);
        var old = style.get();
        style.load(styleData);
        if (this.block.page.user) {
            await this.block.updateProps({
                editor: this.block.page.user.id,
                editDate: Date.now()
            })
        }

        this.block.page.snapshoot.record(OperatorDirective.$merge_style, {
            pos: style.pos,
            old_value: old,
            new_value: style.get()
        }, this.block)
        this.block.page.notifyActionBlockUpdate(this.block);
    }
    async deleteStyle(styleId: string) {
        var style = this.styles.find(g => g.id == styleId);
        if (style) {
            if (this.block.page.user) {
                await this.block.updateProps({
                    editor: this.block.page.user.id,
                    editDate: Date.now()
                })
            }
            this.block.page.snapshoot.record(OperatorDirective.$delete_style, {
                pos: style.pos,
                data: style.get()
            }, this.block);
            this.styles.remove(g => g.id == styleId);
        }
        this.block.page.notifyActionBlockUpdate(this.block);
    }
    async createStyle(styleData: Record<string, any>) {
        var sty = new BlockStyleCss(styleData, this);
        this.styles.push(sty);
        if (this.block.page.user) {
            await this.block.updateProps({
                editor: this.block.page.user.id,
                editDate: Date.now()
            })
        }
        this.block.page.snapshoot.record(OperatorDirective.$insert_style, {
            pos: sty.pos,
            data: sty.get()
        }, this.block);
        this.block.page.notifyActionBlockUpdate(this.block);
    }
    async setFontStyle(style: Partial<FontCss>) {
        await this.setStyle(BlockCssName.font, style);
    }
    async setFillStyle(style: Partial<FillCss>) {
        await this.setStyle(BlockCssName.fill, style);
    }
    async setSvgStyle(style: Partial<SvgCss>) {
        await this.setStyle(BlockCssName.svg, style);
    }
    async setStyles(styles: Record<BlockCssName, Record<string, any>>) {
        if (!styles || lodash.isObject(styles) && Object.keys(styles).length == 0) return;
        for (var n in styles) {
            var name = typeof n == 'string' ? BlockCssName[n] : n;
            await this.setStyle(name, styles[n]);
        }
    }
    css(cssName: BlockCssName) {
        var style = this.blockStyle;
        if (style)
            return style.css(cssName)
    }
    getFontStyle() {
        return this.css(BlockCssName.font)
    }
    getFillStyle() {
        return this.css(BlockCssName.fill);
    }
    getSvgStyle() {
        return this.css(BlockCssName.svg);
    }
    isEqual(pattern: Pattern) {
        var r = this.styles[0]?.style;
        var g = pattern.styles[0]?.style;
        return util.valueIsEqual(r, g)
    }
}

export interface Pattern {
    css(name: BlockCssName.font): FontCss;
    css(name: BlockCssName.fill): FillCss;
    css(name: BlockCssName.border): BorderCss;
    css(name: BlockCssName.radius): RadiusCss;
    css(name: BlockCssName.shadow): ShadowCss;
    css(name: BlockCssName.filter): FilterCss;
    css(name: BlockCssName.transform): TransformCss;
    css(name: BlockCssName.svg): SvgCss;
}