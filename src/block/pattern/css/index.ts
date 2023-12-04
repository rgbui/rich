
import { CSSProperties } from "react";
import { util } from "../../../../util/util";

export enum BlockCssName {
    font,
    fill,
    border,
    shadow,
    filter,
    radius,
    transform,
    gap,
    svg
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
    cloneData() {
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
            case BlockCssName.svg:
                return (new SvgCss(css));
        }
    }
    get style() {
        return {}
    }
}

export class FontCss extends BlockCss {
    cssName = BlockCssName.font;
    fontFamily: string;
    color: string | { grad: string, color: string };
    fontSize: number;
    lineHeight: number | string;
    fontStyle: 'normal' | 'italic';
    // fontGrad: { grad: string, color: string };
    fontWeight: 'normal' | 'bold' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    letterSpacing: 'normal' | number;
    textDecoration: 'none' | 'line-through' | 'underline';
    textDecorationStyle: 'solid' | 'dashed';
    textDecorationColor: string;
    textShadow: { abled: boolean, x: number, y: number, color: string, blur: number }[];
    /**
     * 文字排版方向，这个主要是在做ppt，海报时，特别的有用
     */
    writingMode: 'lr-tb' | 'tb-rl';
    get style(): CSSProperties {
        var style: CSSProperties = {
            fontSize: this.fontSize,
            lineHeight: typeof this.lineHeight == 'number' ? this.lineHeight + 'px' : (this.lineHeight || 1.3),
            textDecoration: this.textDecoration,
            fontStyle: this.fontStyle,
            fontFamily: this.fontFamily || undefined,
            fontWeight: this.fontWeight,
            writingMode: this.writingMode as any
        }
        if (typeof this.color == 'string') {
            style.color = this.color;
        }
        else if ((this.color as any)?.color) {
            style.backgroundImage = (this.color as any)?.grad;
            style.color = (this.color as any)?.color;
            style.WebkitBackgroundClip = 'text';
        }
        return style;
    }
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
    get style() {
        if (this.mode == 'color') {
            return { backgroundColor: this.color };
        }
        else return {}
    }
}
export class BorderCss extends BlockCss {
    cssName = BlockCssName.border;
    top: { width: number, color: string, style: "solid" | 'none' | 'dashed', abled: boolean };
    left: { width: number, color: string, style: "solid" | 'none' | 'dashed', abled: boolean };
    right: { width: number, color: string, style: "solid" | 'none' | 'dashed', abled: boolean };
    bottom: { width: number, color: string, style: "solid" | 'none' | 'dashed', abled: boolean };
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

export class GapCss extends BlockCss {
    cssName = BlockCssName.gap;
    margin: { top: number, left: number, right: number, bottom: number }
    padding: { top: number, left: number, right: number, bottom: number }
}

export class SvgCss extends BlockCss {
    cssName = BlockCssName.svg;
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    strokeDasharray: 'none' | 'dash' | 'dash-larger' | 'dash-circle';
    fill: string;
    fillOpacity: number;
    get style() {
        var st = {
            stroke: this.stroke,
            strokeDasharray: this.strokeDasharray == 'none' || typeof this.strokeDasharray == 'undefined' || this.strokeDasharray === null ? undefined : (this.strokeDasharray == 'dash' ? "10,10" : "20,20"),
            strokeWidth: this.strokeWidth,
            strokeOpacity: typeof this.strokeOpacity == 'number' ? this.strokeOpacity : 1,
            fill: this.fill,
            fillOpacity: typeof this.fillOpacity == 'number' ? this.fillOpacity : 1
        };
        if (this.strokeDasharray == 'dash-circle') {
            st.strokeDasharray = (0) + "," + (this.strokeWidth*2);
        }
        return st;
    }
}