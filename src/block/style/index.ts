import { util } from "../../util/util";
import { Block } from "..";
import { BlockState } from "../base/enum";
import { BorderStyle, FillStyle, FilterStyle, FontStyle, RadiusStyle, ShadowStyle, TransformStyle } from "./type";

export class BlockStyle {
    block: Block;
    id: string;
    date: number;
    /**
     * 表标当前的样式依赖于其它block，
     * 比如鼠标移到一个block，
     * 某个元素会发生变化
     */
    dependBlockId: string;
    dependStyleId: string;
    /***
     * 当前样式的状态
     */
    state: BlockState;
    styles: Record<string, Style> = {};
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
                var style = new Style(options.styles[n]);
                this.styles[n] = style;
            }
        }
        if (typeof this.id == 'undefined') {
            this.id = util.guid();
            this.date = new Date().getTime();
        }
    }
    async get() {
        var json: Record<string, any> = {
            id: this.id,
            date: this.date,
            dependBlockId: this.dependBlockId,
            dependStyleId: this.dependStyleId,
            state: this.state
        };
        return json;
    }

}
export class Style {
    font: FontStyle;
    border: BorderStyle;
    shadows: ShadowStyle;
    radius: RadiusStyle;
    filters: FilterStyle;
    fills: FillStyle;
    transform: TransformStyle;
    constructor(options) {
        for (var n in options) {
            this[n] = util.clone(options[n]);
        }
    }
    get() {
        var json: Record<string, any> = {};
        ['font', 'border', 'shadows', 'radius', 'filters', 'fills', 'transform'].each(c => {
            if (typeof this[c] != 'undefined') json[c] = util.clone(this[c]);
        })
        return json;
    }
}