
import { util } from "./util";
let __g: CanvasRenderingContext2D;
export class MeaureWord {
    fontStyle: TextFontStyle;
    constructor(fontStyle: TextFontStyle) {
        this.fontStyle = fontStyle;
    }
    /**
     * 获取文字和宽度
     */
    get letterSpacing() {
        var ls = 0;
        if (typeof this.fontStyle.letterSpacing == 'undefined') ls = 0;
        else if (typeof this.fontStyle.letterSpacing == 'string') ls = parseFloat(this.fontStyle.letterSpacing.replace('px', ''));
        else if (typeof this.fontStyle.letterSpacing == 'number') ls = this.fontStyle.letterSpacing;
        return ls;
    }
    /**
     * 测量文本的宽度
     * @param text 
     */
    textWidth(text: string) {
        var ts = text.split('');
        var fontStyle = this.fontStyle;
        var letterSpacing = fontStyle.letterSpacing;
        var ls = 0;
        if (typeof letterSpacing == 'undefined') ls = 0;
        else if (typeof fontStyle.letterSpacing == 'string') ls = parseFloat(fontStyle.letterSpacing.replace('px', ''));
        else if (typeof fontStyle.letterSpacing == 'number') ls = fontStyle.letterSpacing;
        var width = 0;
        for (let i = 0; i < ts.length; i++) {
            let word = ts[i];
            var w = this.wordWidth(word) + ls;
            width += w;
        }
        return width;
    }
    /**
     * 测量单个字符的宽度
     * @param word 
     */
    wordWidth(word: string) {
        if (word == '') return 0;
        if (!__g) {
            var canvas = document.createElement('canvas')//首先创建一个canvas标签
            __g = canvas.getContext("2d");//把canvas的画笔给调出来
            canvas.style.display = 'none';
        }
        var fontStyle = this.fontStyle;
        __g.font = `${fontStyle.fontStyle} ${fontStyle.fontVariant} ${fontStyle.fontWeight} ${fontStyle.fontSize}/${fontStyle.lineHeight} ${fontStyle.fontFamily}`;
        return __g.measureText(word).width;
    }
}

export type TextFontStyle = {
    fontStyle: string,
    fontVariant: string,
    fontWeight: string,
    fontSize: string,
    lineHeight: string,
    fontFamily: string,
    letterSpacing?: string,
    color?: string
}
export function getEleFontStyle(ele: HTMLElement): TextFontStyle {
    return {
        fontStyle: util.getStyle(ele, 'fontStyle'),
        fontVariant: util.getStyle(ele, 'fontVariant'),
        fontWeight: util.getStyle(ele, 'fontWeight'),
        fontSize: util.getStyle(ele, 'fontSize'),
        lineHeight: util.getStyle(ele, 'lineHeight'),
        fontFamily: util.getStyle(ele, 'fontFamily'),
        letterSpacing: util.getStyle(ele, 'letterSpacing'),
        color: util.getStyle(ele, 'color')
    }
}
