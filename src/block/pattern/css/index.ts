

export abstract class BlockCss {
    abled: boolean;
    cssName: string;
}

export class FontCss extends BlockCss {
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
    top: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean };
    left: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean };
    right: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean };
    bottom: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean };
}
export class RadiusCss extends BlockCss {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
}

export class ShadowCss extends BlockCss {
    abled: boolean;
    mode: 'inner' | 'outer';
    x: number;
    y: number;
    spread?: number;
    blur: number;
    color: number
}

export class FilterCss extends BlockCss {
    abled: boolean;
    name: string;
    value: any;
}

export class TransformCss extends BlockCss {
    rotate: number;
    scale: { x: number, y: number };
    translate: { x: number, y: number };
    skew: { x: number, y: number };
    origin: { x: number | string, y: number | string }
}