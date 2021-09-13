
import { Exception, ExceptionType } from "../error/exception";
import { dom } from "./dom";
import { Point, Rect } from "./point";
let __g: CanvasRenderingContext2D;
export class TextEle {
    static getFontStyle(ele: HTMLElement): TextFontStyle {
        try {
            var dm = dom(ele);
            var fontStyle = {
                fontStyle: dm.style('fontStyle'),
                fontVariant: dm.style('fontVariant'),
                fontWeight: dm.style('fontWeight'),
                fontSize: dm.style('fontSize'),
                lineHeight: dm.style('lineHeight'),
                fontFamily: dm.style('fontFamily'),
                letterSpacing: dm.style('letterSpacing'),
                color: dm.style('color')
            };
            if (fontStyle.lineHeight == 'normal' || fontStyle.lineHeight == 'inherit') {
                var e = dm.closest(g => dom(g as HTMLElement).style('lineHeight') != 'normal' && dom(g as HTMLElement).style('lineHeight') != 'inherit')
                if (e)
                    fontStyle.lineHeight = dom(e as HTMLElement).style('lineHeight');
            }
            if (!/^[\d\.]+px$/.test(fontStyle.lineHeight)) {
                throw new Exception(ExceptionType.fontStyleLineHeightIsNumber, 'the font lineHeight is not number' + fontStyle.lineHeight)
            }
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
    static getContentBound(ele: HTMLElement) {
        var bound = ele.getBoundingClientRect();
        var toNumber = (g) => {
            if (typeof g == 'number') return g;
            else if (typeof g == 'string') {
                g = g.replace(/[^\d\.]/g, "");
                g = parseFloat(g);
                if (isNaN(g)) g = 0;
            }
            return g;
        }
        var dm = dom(ele);
        var innerTop = toNumber(dm.style('paddingTop')) + toNumber(dm.style('borderTopWidth'));
        var innerLeft = toNumber(dm.style('paddingLeft')) + toNumber(dm.style('borderLeftWidth'));
        var innerRight = toNumber(dm.style('paddingRight')) + toNumber(dm.style('borderRightWidth'));
        var innerBottom = toNumber(dm.style('paddingBottom')) + toNumber(dm.style('borderBottomWidth'));
        var rect = Rect.from(bound);
        rect.left += innerLeft;
        rect.top += innerTop;
        rect.width -= innerLeft + innerRight;
        rect.height -= innerTop + innerBottom;
        return rect;
    }
    static getLineByAt(ele: HTMLElement, at: number) {
        var content = this.getTextContent(ele);
        var ts = content.split("");
        var rect = new Rect();
        var dm = dom(ele);
        var currentDisplay = dm.style('display');
        var currentRect = Rect.from(ele.getBoundingClientRect());
        if (currentDisplay == 'inline') {
            var closetELe = dm.closest(g => {
                var display = dom(g as HTMLElement).style("display");
                if (display != 'inline') return true;
            }) as HTMLElement;
            if (closetELe) {
                rect = this.getContentBound(closetELe);
            }
        }
        else rect = currentRect;
        var fontStyle = this.getFontStyle(ele);
        var rowWidth = rect.width;
        var firstRowWidth = currentRect.width;
        var rowCount = 1;
        var row = { x: currentRect.left };
        var lineHeight = fontStyle.lineHeight;
        let i = 0;
        var point = new Point(0, 0);
        var currentRow = 0;
        for (; i < ts.length; i++) {
            if (i == at) {
                point.x = row.x;
                point.y = (rowCount - 1) * lineHeight + rect.top;
                currentRow = rowCount;
            }
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
                row.x += w;
            }
        }
        if (at == ts.length) {
            point.x = row.x;
            point.y = (rowCount - 1) * lineHeight + currentRect.top;
            currentRow = rowCount;
        }
        return {
            total: rowCount,
            line: currentRow,
            lineheight: lineHeight,
            point
        }
    }
    static getAt(ele: HTMLElement, point: Point) {
        var content = this.getTextContent(ele);
        var ts = content.split("");
        var rect = new Rect();
        var dm = dom(ele);
        var currentDisplay = dm.style('display');
        var currentBouds = this.getBounds(ele);
        var currentRect = currentBouds.first();
        if (currentDisplay == 'inline') {
            var closetELe = dm.closest(g => {
                var display = dom(g as HTMLElement).style("display");
                if (display != 'inline') return true;
            }) as HTMLElement;
            if (closetELe) {
                rect = this.getContentBound(closetELe);
                /**
                 * 有部分的元素很蛋疼，外边的ele反而比里面的文字内容范围还小了
                 */
                if (rect.top > currentRect.top) {
                    rect.top = currentRect.top;
                }
                if (rect.height < currentRect.height) {
                    rect.height = currentRect.height;
                }
            }
        }
        else rect = currentRect;
        /**
         * 外面的容器rect是当前第一行最在的宽度，
         * 第一行前面有可能还有其它元素，
         * 第一行元素准确的宽度不是自身的宽，是最外层的父宽度减于当前的偏移left
         */
        if (rect !== currentRect) {
            currentRect.width = rect.width - (currentRect.left - rect.left);
        }
        var fontStyle = this.getFontStyle(ele);
        var rowWidth = rect.width;
        var firstRowWidth = currentRect.width;
        var rowCount = 1;
        var row = { x: currentRect.left };
        var lineHeight = fontStyle.lineHeight;
        var top = point.y - currentRect.top;
        var left = point.x;
        var currentBoundRight = currentBouds.max(g => g.left + g.width);
        var currentBoundBottom = currentBouds.max(g => g.top + g.height);
        var currentBoundLeft = currentBouds.min(g => g.left);
        /***
         * 注意坐标点有可能不在文字的编辑区域，
         * 此时需要考虑坐标点是靠左，靠上，还是靠下，还是靠右
         */
        if (top <= 0) top = 1;
        if (left > currentBoundRight) left = currentBoundRight - 1;
        if (point.y >= currentBoundBottom) {
            /**
             * 文本内容的高度并不一定是按lineHeight成陪显示的，这里取最后一行-1
             */
            var totalRows = Math.floor((currentBoundBottom - currentRect.top) / lineHeight);
            top = totalRows * lineHeight - 1;
        }
        if (left < currentBoundLeft) left = currentBoundLeft + 1;
        let i = 0;
        for (; i < ts.length; i++) {
            var word = ts[i];
            /**
             * https://zhidao.baidu.com/question/386412786.html
             */
            if (word == '\n' || word == '\r') {
                row.x = rect.left;
                rowCount += 1;
                if (top >= (rowCount - 2) * lineHeight && top < (rowCount - 1) * lineHeight) {
                    return i;
                }
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
                    if (top >= (rowCount - 2) * lineHeight && top < (rowCount - 1) * lineHeight) {
                        return i - 1;
                    }
                }
                else if (rowCount > 1 && row.x + w > rowWidth + rect.left) {
                    row.x = rect.left;
                    rowCount += 1;
                    if (top >= (rowCount - 2) * lineHeight && top < (rowCount - 1) * lineHeight) {
                        return i - 1;
                    }
                }
                if (top >= (rowCount - 1) * lineHeight && top < rowCount * lineHeight) {
                    if (left >= row.x && left < row.x + w) {
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
        function getText(el: HTMLElement) {
            var cs = el.childNodes;
            var text = '';
            for (let i = 0; i < cs.length; i++) {
                var c = cs[i];
                if (c instanceof Text) {
                    var r = c.textContent;
                    if (r === null || typeof r === undefined) r = '';
                    text += r;
                }
                else if (c instanceof HTMLElement) {
                    if (c.classList.contains('shy-anchor-appear')) continue;
                    else {
                        text += getText(c);
                    }
                }
            }
            return text;
        }
        return getText(ele);
    }
    static getTextHtml(content: string) {
        var c = content;
        if (!c) c = '';
        if (typeof c == 'number') c = (c as any).toString();
        if (typeof c != 'string') console.trace(content);
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
        var disPoint = new Point(1e8, 1e8);
        bounds.each(bound => {
            if (point.x >= bound.left && point.x <= bound.left + bound.width) disPoint.x = 0;
            else disPoint.x = Math.min(disPoint.x, Math.abs(point.x - bound.left), Math.abs(point.x - bound.left - bound.width))
            if (point.y >= bound.top && point.y <= bound.top + bound.height) disPoint.y = 0;
            else disPoint.y = Math.min(disPoint.y, Math.abs(point.y - bound.top), Math.abs(point.y - bound.top - bound.height))
        });
        return disPoint;
    }
    static getValueTextContent(value: any) {
        var c = value;
        if (typeof c == 'string') return c;
        else if (c === null || c === undefined) return '';
        else if (c && typeof (c as any).toString == 'function') return (c as any).toString();
        return '';
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