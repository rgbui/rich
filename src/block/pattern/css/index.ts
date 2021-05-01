import { util } from "../../../util/util";

export enum BlockCssName {
    font,
    fill,
    border,
    shadow,
    filter,
    radius,
    transform
}


export abstract class BlockCss {
    constructor(data?: Record<string, any>) {
        if (data) this.load(data);
    }
    abled: boolean = true;
    cssName: BlockCssName;
    load(data) {
        for (var n in data) {
            this[n] = util.clone(data[n]);
        }
    }
    get() {
        var json: Record<string, any> = {};
        for (var n in this) {
            if (typeof this[n] != 'function') {
                json[n] = util.clone(this[n]);
            }
        }
        return json;
    }
    overlay<T extends BlockCss>(css: T): T {
        if (this.cssName != css.cssName) throw new Error('the overlay css name is not equal' + BlockCssName[this.cssName] + '!=' + BlockCssName[css.cssName])
        var json: Record<string, any> = { cssName: this.cssName };
        if (this.abled == true) json = this.get();
        if (css.abled == true) json = Object.assign(json, css.get());
        return BlockCss.createBlockCss(json) as any;
    }
    static createBlockCss(css: Record<string, any>) {
        if (typeof css.cssName == 'string') css.cssName = BlockCssName[css.cssName];
        if (typeof css.cssName != 'number') throw new Error('not found block css name' + css.cssName);
        switch (css.cssName) {
            case BlockCssName.font:
                return (new FontCss(css));
            case BlockCssName.fill:
                return (new FillCss(css));
            case BlockCssName.border:
                return (new BorderCss(css));
            case BlockCssName.shadow:
                return (new ShadowCss(css));
            case BlockCssName.radius:
                return (new RadiusCss(css));
            case BlockCssName.filter:
                return (new FillCss(css));
            case BlockCssName.transform:
                return (new TransformCss(css));
        }
    }
}

export class FontCss extends BlockCss {
    cssName = BlockCssName.font;
    fontFamily: string;
    color: string;
    fontSize: number;
    lineHeight: number;
    fontStyle: 'normail' | 'italic';
    fontWeight: 'normal' | 'bold' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    letterSpacing: 'normal' | number;
    textDecoration: 'none' | 'lineThrough' | 'underline';
    textDecorationStyle: 'solid' | 'dashed';
    textDecorationColor: string;
    textShadow: { abled: boolean, x: number, y: number, color: string, blur: number }[];
    /**
     * 文字排版方向，这个主要是在做ppt，海报时，特别的有用
     */
    writingMode: 'lr-tb' | 'tb-rl'
}

export class FillCss extends BlockCss {
    cssName = BlockCssName.fill;
    mode: 'color' | 'image' | 'linear-gradient' | 'radial-gradient';
    /***
     * background-color:color
     */
    color: string;
    /***background-image */
    src: string;
    /***linear-gradient */
    angle: number;
    grads: { grad: number, color: string }[];
    /****
     * radial-gradient
     * https://www.runoob.com/cssref/func-radial-gradient.html
     * 径向用户使用频率不高，暂时保留
     */
    shape: "circle" | 'ellipse';
    size: 'farthest-corner' | 'closest-side' | 'closest-corner' | 'farthest-side';
    position: { x: number, y: number }
}
export class BorderCss extends BlockCss {
    cssName = BlockCssName.border;
    top: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean };
    left: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean };
    right: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean };
    bottom: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean };
}
export class RadiusCss extends BlockCss {
    cssName = BlockCssName.radius;
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
}

export class ShadowCss extends BlockCss {
    cssName = BlockCssName.shadow;
    abled: boolean;
    mode: 'inner' | 'outer';
    x: number;
    y: number;
    spread?: number;
    blur: number;
    color: number
}

export class FilterCss extends BlockCss {
    cssName = BlockCssName.filter;
    abled: boolean;
    name: string;
    value: any;
}

export class TransformCss extends BlockCss {
    cssName = BlockCssName.transform;
    rotate: number;
    scale: { x: number, y: number };
    translate: { x: number, y: number };
    skew: { x: number, y: number };
    origin: { x: number | string, y: number | string }
}