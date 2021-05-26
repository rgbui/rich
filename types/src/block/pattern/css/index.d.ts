export declare enum BlockCssName {
    font = 0,
    fill = 1,
    border = 2,
    shadow = 3,
    filter = 4,
    radius = 5,
    transform = 6
}
export declare abstract class BlockCss {
    constructor(data?: Record<string, any>);
    abled: boolean;
    cssName: BlockCssName;
    load(data: any): void;
    get(): Record<string, any>;
    cloneData(): Record<string, any>;
    overlay<T extends BlockCss>(css: T): T;
    static createBlockCss(css: Record<string, any>): FontCss | FillCss | BorderCss | ShadowCss | RadiusCss | TransformCss;
    get style(): {};
}
export declare class FontCss extends BlockCss {
    cssName: BlockCssName;
    fontFamily: string;
    color: string;
    fontSize: number;
    lineHeight: number;
    fontStyle: 'normail' | 'italic';
    fontWeight: 'normal' | 'bold' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    letterSpacing: 'normal' | number;
    textDecoration: 'none' | 'line-through' | 'underline';
    textDecorationStyle: 'solid' | 'dashed';
    textDecorationColor: string;
    textShadow: {
        abled: boolean;
        x: number;
        y: number;
        color: string;
        blur: number;
    }[];
    /**
     * 文字排版方向，这个主要是在做ppt，海报时，特别的有用
     */
    writingMode: 'lr-tb' | 'tb-rl';
    get style(): {
        color: string;
        fontSize: number;
        lineHeight: number;
        textDecoration: "none" | "line-through" | "underline";
        fontStyle: "normail" | "italic";
        fontFamily: string;
        fontWeight: 100 | 600 | "normal" | "bold" | 200 | 300 | 400 | 500 | 700 | 800 | 900;
        writingMode: "lr-tb" | "tb-rl";
    };
}
export declare class FillCss extends BlockCss {
    cssName: BlockCssName;
    mode: 'color' | 'image' | 'linear-gradient' | 'radial-gradient';
    /***
     * background-color:color
     */
    color: string;
    /***background-image */
    src: string;
    /***linear-gradient */
    angle: number;
    grads: {
        grad: number;
        color: string;
    }[];
    /****
     * radial-gradient
     * https://www.runoob.com/cssref/func-radial-gradient.html
     * 径向用户使用频率不高，暂时保留
     */
    shape: "circle" | 'ellipse';
    size: 'farthest-corner' | 'closest-side' | 'closest-corner' | 'farthest-side';
    position: {
        x: number;
        y: number;
    };
}
export declare class BorderCss extends BlockCss {
    cssName: BlockCssName;
    top: {
        width: number;
        color: string;
        style: "sold" | 'none' | 'dashed';
        abled: boolean;
    };
    left: {
        width: number;
        color: string;
        style: "sold" | 'none' | 'dashed';
        abled: boolean;
    };
    right: {
        width: number;
        color: string;
        style: "sold" | 'none' | 'dashed';
        abled: boolean;
    };
    bottom: {
        width: number;
        color: string;
        style: "sold" | 'none' | 'dashed';
        abled: boolean;
    };
}
export declare class RadiusCss extends BlockCss {
    cssName: BlockCssName;
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
}
export declare class ShadowCss extends BlockCss {
    cssName: BlockCssName;
    abled: boolean;
    mode: 'inner' | 'outer';
    x: number;
    y: number;
    spread?: number;
    blur: number;
    color: number;
}
export declare class FilterCss extends BlockCss {
    cssName: BlockCssName;
    abled: boolean;
    name: string;
    value: any;
}
export declare class TransformCss extends BlockCss {
    cssName: BlockCssName;
    rotate: number;
    scale: {
        x: number;
        y: number;
    };
    translate: {
        x: number;
        y: number;
    };
    skew: {
        x: number;
        y: number;
    };
    origin: {
        x: number | string;
        y: number | string;
    };
}
