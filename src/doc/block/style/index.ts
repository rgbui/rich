import { util } from "../../../util/util";
import { BaseBlock } from "../base/base";
import { BlockState } from "../common.enum";
import { BorderStyle, FillStyle, FilterStyle, FontStyle, RadiusStyle, ShadowStyle, TransformStyle } from "./type";

export class Style {
    block: BaseBlock;
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
    constructor(block: BaseBlock) {
        this.block = block;
    }
    async load(options: Record<string, any>) {
        for (var op in options) {
            this[op] = options[op];
        }
        if (typeof this.id == 'undefined') {
            this.id = util.guid();
            this.date = new Date().getTime();
        }
    }
    async get() {
        var json: Record<string, any> = {
            id: this.id, date: this.date,
            dependBlockId: this.dependBlockId,
            dependStyleId: this.dependStyleId,
            state: this.state
        };
        ['font', 'border', 'shadows', 'radius', 'filters', 'fills', 'transform'].each(c => {
            if (typeof this[c] != 'undefined') json[c] = util.clone(this[c]);
        })
        return json;
    }
    font: FontStyle;
    border: BorderStyle;
    shadows: ShadowStyle;
    radius: RadiusStyle;
    filters: FilterStyle;
    fills: FillStyle;
    transform: TransformStyle;
}