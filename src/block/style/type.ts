/****
 * 控件的样式
 * 里面的图片，和字体都会涉及到引用其它文件的可能性
 * 
 */
export type FontStyle = {
    fontFamily: string;
    color: string;
    fontSize: number,
    lineHeight: number,
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
export type FillStyle = {
    abled: boolean,
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
}[]
export type BorderStyle = {
    top: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean },
    left: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean },
    right: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean },
    bottom: { width: number, color: string, style: "sold" | 'none' | 'dashed', abled: boolean }
}
export type RadiusStyle = {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number
}
export type ShadowStyle = {
    abled: boolean,
    mode: 'inner' | 'outer';
    x: number, y: number, spread?: number, blur: number, color: number
}[]
/***
 * https://www.runoob.com/cssref/css3-pr-filter.html
 */
export type FilterStyle = {
    abled: boolean;
    name: string;
    value: any;
}[]

/***
 * https://www.jianshu.com/p/8a33214a1b26
 */
export type TransformStyle = {
    rotate: number;
    scale: { x: number, y: number },
    translate: { x: number, y: number },
    skew: { x: number, y: number },
    origin: { x: number | string, y: number | string }
}