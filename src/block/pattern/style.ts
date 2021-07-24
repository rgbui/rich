import { Pattern } from ".";
import { util } from "../../../util/util";
import { BlockCss, BlockCssName } from "./css";
import { CssSelectorType } from "./type";

export class BlockStyleCss {
    pattern: Pattern;
    constructor(options: Record<string, any>, pattern: Pattern) {
        this.pattern = pattern;
        this.id = util.guid();
        this.date = Date.now();
        if (typeof options == 'object') {
            this.load(options);
        }
    }
    /**
     * 是否为某个部位的样式
     */
    part?: string;
    selector: CssSelectorType;
    id: string;
    date: number;
    /**
     * 如果selector是class，那么name里存的就是当前的样式类
     * 如果selector是伪类，那么name就是伪类的名称
     */
    name: string;
    cssList: BlockCss[] = [];
    depend: { blockId: string, styleId: string };
    load(options) {
        for (var n in options) {
            if (n == 'cssList') {
                this.cssList = [];
                options[n].each(css => {
                    this.cssList.push(BlockCss.createBlockCss(css));
                })
            }
            else {
                this[n] = util.clone(options[n]);
            }
        }
    }
    get() {
        var json: Record<string, any> = {
            cssList: this.cssList.map(x => x.get()),
            name: this.name,
            date: this.date,
            id: this.id,
            depend: util.clone(this.depend),
            selector: this.selector,
            part: this.part
        };
        return json;
    }
    cloneData() {
        var json: Record<string, any> = {
            cssList: this.cssList.map(x => x.cloneData()),
            name: this.name,
            date: this.date,
            id: this.id,
            depend: util.clone(this.depend),
            selector: this.selector,
            part: this.part
        };
        return json;
    }
    merge(css: BlockCss) {
        var cs = this.cssList.find(x => x.cssName == css.cssName);
        if (cs) {
            Object.assign(cs, css);
        }
        else this.cssList.push(css);
    }
    get style() {
        var style: Record<string, any> = {};
        this.cssList.each(css => {
            Object.assign(style, css.style);
        })
        return style;
    }
    css(name: BlockCssName) {
        return this.cssList.find(g => g.cssName == name);
    }
}

