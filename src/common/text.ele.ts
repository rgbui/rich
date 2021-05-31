
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
            }
        }
        else rect = currentRect;
        var fontStyle = this.getFontStyle(ele);
        var rowWidth = rect.width;
        var firstRowWidth = currentRect.width;
        var rowCount = 1;
        var row = { x: currentRect.left };
        var lineHeight = fontStyle.lineHeight;
        var top = point.y - currentRect.top;
        var left = point.x;

        // console.log('bounds', currentBouds);
        // console.log('rect', rect);
        // console.log('currentRect', currentRect);

        var currentBoundRight = currentBouds.max(g => g.left + g.width);
        var currentBoundBottom = currentBouds.max(g => g.top + g.height);
        var currentBoundLeft = currentBouds.min(g => g.left);
        /***
         * 注意坐标点有可能不在文字的编辑区域，
         * 此时需要考虑坐标点是靠左，靠上，还是靠下，还是靠右
         */
        if (top <= 0) top = 1;
        if (left > currentBoundRight) left = currentBoundRight - 1;
        if (point.y >= currentBoundBottom && point.y <= currentBoundBottom + lineHeight)
            top = currentBoundBottom - currentRect.top - 1;
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
                    if (c.classList.contains('sy-anchor-appear')) continue;
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