import { AppearAnchor } from ".";
import { Block } from "..";
import { dom } from "../../common/dom";
import { TextEle } from "../../common/text.ele";
import { Rect } from "../../common/vector/point";
const GAP = 10;
function findBlockAppear(el) {
    if (el) {
        var r = el.closest('.shy-appear-text');
        if (r) {
            var blockEl = dom(r).closest(x => (x as any).block);
            if (blockEl) {
                return ((blockEl as any).block as Block).appearAnchors.find(g => g.el == r);
            }
        }
    }
}

function findXBlockAppear(appear: AppearAnchor, start: number, top: number, bound: Rect, direction: 'left' | 'right') {
    if (direction == 'left') {
        for (var i = start - GAP; i >= bound.x; i = i - GAP) {
            var el = document.elementFromPoint(i, top) as HTMLElement;
            var fa = findBlockAppear(el);
            if (fa) return fa;
            else if (el) {
                var rg = el.querySelector('.shy-appear-text');
                if (!rg) {
                    var lx = el.getBoundingClientRect().left;
                    if (i > lx) i = lx;
                }
            }
        }
    }
    else if (direction == 'right') {
        for (var i = start + GAP; i <= bound.x + bound.width; i = i + GAP) {
            var el = document.elementFromPoint(i, top) as HTMLElement;
            var fa = findBlockAppear(el);
            if (fa) return fa;
            else if (el) {
                var rg = el.querySelector('.shy-appear-text');
                if (!rg) {
                    var rc = el.getBoundingClientRect();
                    var lx = rc.left + rc.width;
                    if (i < lx) i = lx;
                }
            }
        }
    }
}

/***
 * 查找的时候，如果元素不在视野中 document.elementFromPoint是查找不到的。
 */
export function AppearVisibleSeek(appear: AppearAnchor, options: {
    arrow: 'left' | 'right' | 'down' | 'up'
}) {
    var panel = appear.block.page.root;
    var el = appear.el as HTMLElement;
    var bound = Rect.fromEle(panel);
    var eb = Rect.fromEle(el);
    var lineHeight = TextEle.getLineHeight(el);
    if (options.arrow == 'left') {
        /**
         * 水平查找
         */
        var rs = findXBlockAppear(appear, eb.x, eb.top - lineHeight / 2, bound, 'left');
        if (rs) return rs;
        /**
         * 垂直查找
         */
        for (var j = eb.y - GAP; j >= bound.y; j = j - GAP) {
            var rs = findXBlockAppear(appear, bound.x + bound.width, j, bound, 'left');
            if (rs) return rs;
        }
    }
    else if (options.arrow == 'right') {
        /**
         * 水平查找
         */
        var rs = findXBlockAppear(appear, eb.x, eb.top - lineHeight / 2, bound, 'right');
        if (rs) return rs;
        /**
         * 垂直查找
         */
        for (var j = eb.y + GAP; j <= bound.y + bound.height; j = j + GAP) {
            var rs = findXBlockAppear(appear, bound.x + bound.width, j, bound, 'right');
            if (rs) return rs;
        }
    }
    else if (options.arrow == 'down') {
        for (var j = eb.y + eb.height + GAP; j <= bound.y + bound.height; j = j + GAP) {
            var rs = findXBlockAppear(appear, bound.x + bound.width, j, bound, 'left');
            if (rs) return rs;
            rs = findXBlockAppear(appear, bound.x + bound.width, j, bound, 'right');
            if (rs) return rs;
        }
    }
    else if (options.arrow == 'up') {
        for (var j = eb.y - GAP; j >= bound.y; j = j - GAP) {
            var rs = findXBlockAppear(appear, bound.x + bound.width, j, bound, 'left');
            if (rs) return rs;
            rs = findXBlockAppear(appear, bound.x + bound.width, j, bound, 'right');
            if (rs) return rs;
        }
    }
}

export function AppearVisibleCursorPoint(appear: AppearAnchor) {
    var ele = appear.el;
    var content = appear.textContent;
    var sel = window.getSelection();
    /**
     * 说明光标不在当前的appear中
     */
    if (!ele.contains(sel.focusNode)) return null;
    var offset = sel.focusOffset;
    var ts = content.split("");
    var rect = new Rect();
    var dm = dom(ele);
    var currentDisplay = dm.style('display');
    var currentBouds = TextEle.getBounds(ele);
    var currentRect = currentBouds.first();
    if (currentDisplay == 'inline') {
        var closetELe = dm.closest(g => {
            var display = dom(g as HTMLElement).style("display");
            if (display != 'inline') return true;
        }) as HTMLElement;
        if (closetELe) {
            rect = TextEle.getContentBound(closetELe);
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
    var fontStyle = TextEle.getFontStyle(ele);
    var rowWidth = rect.width;
    var firstRowWidth = currentRect.width;
    var rowCount = 1;
    var row = { x: currentRect.left };
    var lineHeight = fontStyle.lineHeight;
    for (let i = 0; i < ts.length; i++) {
        if (i == offset) break;
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
            var w = TextEle.wordWidth(word, fontStyle);
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
    return new Rect(row.x, currentRect.top + (rowCount - 1) * lineHeight, 0, lineHeight)
}