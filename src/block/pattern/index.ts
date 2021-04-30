import { util } from "../../util/util";
import { Block } from "..";
import { BlockStyleCss } from "./style";

export class Pattern {
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
    styles:BlockStyleCss[]=[];
    /***
     * 当前样式的状态
     */
    // state: BlockState;
    constructor(block: Block) {
        this.block = block;
    }
    async load(options: Record<string, any>) {
        // for (var op in options) {
        //     if (op == 'styles') continue;
        //     this[op] = options[op];
        // }
        // if (options.styles) {
        //     for (var n in options.styles) {
        //         var style = new Style(options.styles[n]);
        //         this.styles[n] = style;
        //     }
        // }
        // if (typeof this.id == 'undefined') {
        //     this.id = util.guid();
        //     this.date = new Date().getTime();
        // }
    }
    async get() {
        // var json: Record<string, any> = {
        //     id: this.id,
        //     date: this.date,
        //     dependBlockId: this.dependBlockId,
        //     dependStyleId: this.dependStyleId,
        //     state: this.state
        // };
        // return json;
    }
}
