
import { util } from "../util/util";
import { Point, Rect } from "./point";

let __g: CanvasRenderingContext2D;
export class TextEle {
    static getFontStyle(ele: HTMLElement): TextFontStyle {
        try {
            var fontStyle = {
                fontStyle: util.getStyle(ele, 'fontStyle'),
                fontVariant: util.getStyle(ele, 'fontVariant'),
                fontWeight: util.getStyle(ele, 'fontWeight'),
                fontSize: util.getStyle(ele, 'fontSize'),
                lineHeight: util.getStyle(ele, 'lineHeight'),
                fontFamily: util.getStyle(ele, 'fontFamily'),
                letterSpacing: util.getStyle(ele, 'letterSpacing'),
                color: util.getStyle(ele, 'color')
            };
            fontStyle.lineHeight = parseInt(fontStyle.lineHeight.replace('px', ''));
            fontStyle.letterSpacing = parseInt(fontStyle.letterSpacing.replace('px', ''));
            if (isNaN(fontStyle.letterSpacing)) fontStyle.letterSpacing = 0;
            return fontStyle;
        } catch (e) {
            console.log(e);
            console.log(ele);
            throw e;
        }
    }
    static getBounds(ele: HTMLElement) {
        var cs = ele.getClientRects();
        var rs: Rect[] = [];
        for (var i = 0; i < cs.length; i++) {
            rs.push(Rect.from(cs.item(i)))
        }
        return rs;
    }
    static getAt(ele: HTMLElement, point: Point) {
        var content = this.getTextContent(ele);
        var ts = content.split("");
        var rect = new Rect();
        var currentDisplay = util.getStyle(ele, 'display');
        var currentRect = Rect.from(ele.getBoundingClientRect());
        if (currentDisplay == 'inline') {
            var closetELe = util.domClosest(ele, g => {
                var display = util.getStyle(g, "display");
                if (display == 'inline-block' || display == 'block' || display == 'flex') return true;
            });
            if (closetELe) {
                rect = Rect.from(closetELe.getBoundingClientRect())
            }
        }
        var fontStyle = this.getFontStyle(ele);
        var rowWidth = rect.width;
        var firstRowWidth = currentRect.width;
        var rowCount = 1;
        var row = { x: currentRect.left };
        var lineHeight = fontStyle.lineHeight;
        var top = point.y - rect.top;
        let i = 0;
        for (; i < ts.length; i++) {
            var word = ts[i];
            /**
             * https://zhidao.baidu.com/question/386412786.html
             */
            if (word == '\n' || word == '\r') {
                row.x = rect.left;
                rowCount += 1;
                /**
                 * 如果是\r\n
                 */
                if (ts[i + 1] == '\n' && word == '\r') {
                    i += 1;
                }
            }
            else {
                var w = this.wordWidth(word, fontStyle);
                if (rowCount == 1 && row.x + w > firstRowWidth + currentRect.left) {
                    row.x = rect.left;
                    rowCount += 1;
                }
                else if (rowCount > 1 && row.x + w > rowWidth + rect.left) {
                    row.x = rect.left;
                    rowCount += 1;
                }
                if (top >= (rowCount - 1) * lineHeight && top < rowCount * lineHeight) {
                    if (point.x >= row.x && point.x < row.x + w) {
                        if (row.x + w / 2.0 > point.x) {
                            return i;
                        }
                        else {
                            return i + 1;
                        }
                    }
                }
                row.x += w;
            }
        }
        return i;
    }
    static wordWidth(word: string, fontStyle: TextFontStyle): number {
        if (word == '') return 0;
        if (!__g) {
            var canvas = document.createElement('canvas')//首先创建一个canvas标签
            __g = canvas.getContext("2d");//把canvas的画笔给调出来
            canvas.style.display = 'none';
        }

        var lineHeight: string = fontStyle.lineHeight as any;
        if (typeof lineHeight == 'number') lineHeight = lineHeight + 'px';
        __g.font = `${fontStyle.fontStyle} ${fontStyle.fontVariant} ${fontStyle.fontWeight} ${fontStyle.fontSize}/${lineHeight} ${fontStyle.fontFamily}`;
        var ls = 0;
        if (typeof fontStyle.letterSpacing != 'number') {
            ls = parseFloat((fontStyle.letterSpacing as any).replace('px', ''));
            if (isNaN(ls)) ls = 0;
        }
        else ls = fontStyle.letterSpacing;
        return __g.measureText(word).width + ls;
    }
    static getTextContent(ele: HTMLElement) {
        var cs = ele.childNodes;
        var text = '';
        for (var i = 0; i < cs.length; i++) {
            var el = cs[i];
            if (el instanceof Text) {
                text += el.textContent;
            }
            else if (el instanceof HTMLElement && el.tagName == 'SPAN') {
                if (!el.classList.contains('sy-anchor-appear')) {
                    text += el.innerText;
                }
            }
        }
        return text;
        //var text = ele.innerText;
        //console.log(text, 'gg', ele);
        // text = text.replace(/<br[\s]*\/>/g, "\n");
        // text = text.replace(/<i[^>]*>[\s]*<\/i>/g, '');
        // text = text.replace(/&nbsp;/g, " ");
        // text = text.replace(/&lt;/g, "<");
        // text = text.replace(/&gt;/g, ">");
        //return text;
    }
    static getHtml(content: string) {
        var c = content;
        if (!c) c = '';
        c = c.replace(/ /g, "&nbsp;");
        c = c.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
        c = c.replace(/</, "&lt;");
        c = c.replace(/>/, "&gt;");
        c = c.replace(/\r\n?|\n/g, '<br/>');
        return c;
    }
    /**
     * 计算坐标于bounds的距离，这里分水平和垂直
     * @param point 
     * @param bounds 
     */
    static cacDistance(point: Point, bounds: Rect[]) {
        var disPoint = new Point(1e8,1e8);
        bounds.each(bound => {
            if (point.x >= bound.left && point.x <= bound.left + bound.width) disPoint.x = 0;
            else disPoint.x = Math.min(disPoint.x, Math.abs(point.x - bound.left), Math.abs(point.x - bound.left - bound.width))
            if (point.y >= bound.top && point.y <= bound.top + bound.height) disPoint.y = 0;
            else disPoint.y = Math.min(disPoint.y, Math.abs(point.y - bound.top), Math.abs(point.y - bound.top - bound.height))
        });
        return disPoint;
    }
}
export type TextFontStyle = {
    fontStyle: string,
    fontVariant: string,
    fontWeight: string,
    fontSize: string,
    lineHeight: number,
    fontFamily: string,
    letterSpacing?: number,
    /**
     * 文字颜色，即光标颜色
     */
    color?: string
}