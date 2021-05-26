import { Point, Rect } from "./point";
export declare class TextEle {
    static getFontStyle(ele: HTMLElement): TextFontStyle;
    static getBounds(ele: HTMLElement): Rect[];
    static getContentBound(ele: HTMLElement): Rect;
    static getLineByAt(ele: HTMLElement, at: number): {
        total: number;
        line: number;
        lineheight: number;
        point: Point;
    };
    static getAt(ele: HTMLElement, point: Point): number;
    static wordWidth(word: string, fontStyle: TextFontStyle): number;
    static getTextContent(ele: HTMLElement): string;
    static getTextHtml(content: string): string;
    /**
     * 计算坐标于bounds的距离，这里分水平和垂直
     * @param point
     * @param bounds
     */
    static cacDistance(point: Point, bounds: Rect[]): Point;
}
export declare type TextFontStyle = {
    fontStyle: string;
    fontVariant: string;
    fontWeight: string;
    fontSize: string;
    lineHeight: number;
    fontFamily: string;
    letterSpacing?: number;
    /**
     * 文字颜色，即光标颜色
     */
    color?: string;
};
