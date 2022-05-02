import { AppearAnchor } from ".";
import { Block } from "..";
import { dom } from "../../common/dom";
import { TextEle } from "../../common/text.ele";
import { Rect } from "../../common/vector/point";
const GAP = 10;
export function findBlockAppear(el) {
    if (el) {
        if (el instanceof Text) el = el.parentNode;
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
            if (fa && fa !== appear) return fa;
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
            if (fa && fa !== appear) return fa;
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
 * 查找的时候，如果元素不在视野中 
 * document.elementFromPoint是查找不到的。
 */
export function AppearVisibleSeek(appear: AppearAnchor, options: {
    arrow: 'left' | 'right' | 'down' | 'up',
    left?: number
}) {
    var panel = appear.block.page.root;
    var el = appear.el as HTMLElement;
    var bound = Rect.fromEle(panel);
    var eb: Rect;
    var cs = TextEle.getBounds(el);
    var lineHeight = TextEle.getLineHeight(el);
    var aa: AppearAnchor;
    if (options.arrow == 'left') {
        eb = cs.first();
        /**
         * 水平查找
         */
        aa = findXBlockAppear(appear, eb.x, eb.top + lineHeight / 2, bound, 'left');
        if (aa) return aa;
        /**
         * 垂直查找
         */
        for (var j = eb.y - GAP; j >= Math.max(0, bound.y); j = j - GAP) {
            aa = findXBlockAppear(appear, bound.x + bound.width, j, bound, 'left');
            if (aa) return aa;
        }
        var s = appear.block.prevFind(g => g.appearAnchors.length > 0 && g.appearAnchors.some(s => s.isText));
        if (s) return s.appearAnchors.findLast(g => g.isText);
    }
    else if (options.arrow == 'right') {
        eb = cs.last();
        /**
         * 水平查找
         */
        aa = findXBlockAppear(appear, eb.x, eb.top + lineHeight / 2, bound, 'right');
        if (aa) return aa;
        /**
         * 垂直查找
         */
        for (var j = eb.y + GAP; j <= Math.min(window.innerHeight, bound.y + bound.height); j = j + GAP) {
            aa = findXBlockAppear(appear, bound.x + bound.width, j, bound, 'right');
            if (aa) return aa;
        }
        var s = appear.block.nextFind(g => g.appearAnchors.length > 0 && g.appearAnchors.some(s => s.isText));
        if (s) return s.appearAnchors.find(g => g.isText);
    }
    else if (options.arrow == 'down') {
        eb = cs.last();
        for (var j = eb.bottom + GAP; j <= Math.min(window.innerHeight, bound.bottom); j = j + GAP) {
            aa = findXBlockAppear(appear, options.left || bound.right, j, bound, 'left');
            if (aa) return aa;
            aa = findXBlockAppear(appear, options.left || bound.right, j, bound, 'right');
            if (aa) return aa;
        }
        var s = appear.block.nextFind(g => g.appearAnchors.some(s => s.isText && TextEle.getBounds(s.el).first().top >= eb.bottom));
        if (s) {
            if (s.isLine) {
                var row = s.closest(x => x.isBlock);
                if (row) {
                    var r = row.find(g => g.appearAnchors.some(s => s.isText && TextEle.getBounds(s.el).first().containX(options.left) && TextEle.getBounds(s.el).first().top >= eb.bottom));
                    if (r) {
                        return r.appearAnchors.find(s => s.isText && TextEle.getBounds(s.el).first().containX(options.left) && TextEle.getBounds(s.el).first().top >= eb.bottom)
                    }
                }
            }
            return s.appearAnchors.find(s => s.isText && TextEle.getBounds(s.el).first().top >= eb.bottom);
        }
    }
    else if (options.arrow == 'up') {
        eb = cs.first();
        for (var j = eb.y - GAP; j >= Math.max(0, bound.y); j = j - GAP) {
            aa = findXBlockAppear(appear, options.left || bound.right, j, bound, 'left');
            if (aa) return aa;
            aa = findXBlockAppear(appear, options.left || bound.right, j, bound, 'right');
            if (aa) return aa;
        }
        var s = appear.block.prevFind(g => g.appearAnchors.some(s => s.isText && TextEle.getBounds(s.el).last().bottom <= eb.top));
        if (s) {
            if (s.isLine) {
                var row = s.closest(x => x.isBlock);
                if (row) {
                    var r = row.find(g => g.appearAnchors.some(s => s.isText && TextEle.getBounds(s.el).last().containX(options.left) && TextEle.getBounds(s.el).last().bottom <= eb.top));
                    if (r) {
                        return r.appearAnchors.find(s => s.isText && TextEle.getBounds(s.el).last().containX(options.left) && TextEle.getBounds(s.el).last().bottom <= eb.top)
                    }
                }
            }
            return s.appearAnchors.findLast(s => s.isText && TextEle.getBounds(s.el).last().bottom <= eb.top);
        }
    }
}


/**
 * 这里可以通过光标自动获取光株所在的位置坐标
 * @deprecated 该方法弃用
 * @param appear 
 * @returns 
 */
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

/**
 * 查询两个appearAnchor之间的所有块
 * 
 */
export function findBlocksBetweenAppears(start: HTMLElement, end: HTMLElement) {
    if (TextEle.isBefore(end, start)) {
        [start, end] = [end, start];
    }
    var list: AppearAnchor[] = [];
    if (start !== end) {
        var dm = dom(end);
        dm.prevFind((b: HTMLElement) => {
            var r = findBlockAppear(b);
            if (r) {
                if (!list.includes(r)) list.push(r);
            }
            return false;
        }, false, f => f === start);
    }
    var sa = findBlockAppear(start);
    if (sa && !list.includes(sa)) list.insertAt(0, sa);
    var en = findBlockAppear(end);
    if (end && !list.includes(en)) list.push(en);
    return list;
}