
import { AppearAnchor } from ".";
import { Block } from "..";
import { dom } from "../../common/dom";
import { TextEle } from "../../common/text.ele";
import { Point, Rect } from "../../common/vector/point";
const GAP = 10;
export function findBlockAppear(el, predict?: (block: Block) => AppearAnchor) {
    if (el) {
        if (el instanceof Text) el = el.parentNode;
        else if(el instanceof Comment) el=el.parentNode;
        if (typeof el.closest !== 'function') { console.log(el); return; }
        var r = el.closest('.shy-appear-text');
        if (!r) r = el.closest('.shy-appear-solid');
        if (r) {
            var blockEl = dom(r).closest(x => (x as any)?.block ? true : false);
            if (blockEl) {
                return ((blockEl as any).block as Block).appearAnchors.find(g => g.el == r);
            }
        }
        else {
            var blockEl = dom(el).closest(x => (x as any)?.block ? true : false);
            if (blockEl && predict) {
                return predict(((blockEl as any).block as Block))
            }
        }
    }
}
/**
 * 水平查找，在一定的范围内
 * @param appear 
 * @param start 
 * @param top 
 * @param bound 
 * @param direction 
 * @returns 
 */
export function findXBlockAppear(appear: AppearAnchor, start: number, top: number, bound: Rect, direction: 'left' | 'right') {
    if (direction == 'left') {
        for (var i = start - GAP; i >= bound.x; i = i - GAP) {
            var el = document.elementFromPoint(i, top) as HTMLElement;
            var fa = findBlockAppear(el, b => {
                var aa: AppearAnchor;
                for (let i = b.appearAnchors.length - 1; i >= 0; i--) {
                    var be = b.appearAnchors[i];
                    var rb = Rect.fromEle(be.el);
                    if (rb.containY(top)) return be;
                }
                return aa;
            });
            if (fa && fa !== appear) return fa;
            else if (el) {
                var rg = el.querySelector('.shy-appear-text');
                if (!rg) rg = el.closest('.shy-appear-solid');
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
            var fa = findBlockAppear(el, b => {
                var aa: AppearAnchor;
                for (let i = 0; i < b.appearAnchors.length; i++) {
                    var be = b.appearAnchors[i];
                    var rb = Rect.fromEle(be.el);
                    if (rb.containY(top)) return be;
                }
                return aa;
            });
            if (fa && fa !== appear) return fa;
            else if (el) {
                var rg = el.querySelector('.shy-appear-text');
                if (!rg) rg = el.closest('.shy-appear-solid');
                if (!rg) {
                    var rc = el.getBoundingClientRect();
                    var lx = rc.left + rc.width;
                    if (i < lx) i = lx;
                }
            }
        }
    }
}

export function findBlockAppearByPoint(point: Point, bound: Rect) {
    for (let i = bound.x; i <= bound.x + bound.width; i += GAP) {
        var el = document.elementFromPoint(i, point.y) as HTMLElement;
        if (el) {
            var blockEl = dom(el).closest(x => (x as any)?.block ? true : false);
            if (blockEl) {
                var block = ((blockEl as any).block as Block);
                if (block.isContentBlock) {
                    return block;
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
        var s = appear.block.prevFind(g => g.appearAnchors.length > 0 && g.appearAnchors.length > 0);
        if (s) return s.appearAnchors.findLast(g => true);
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
        var s = appear.block.nextFind(g => g.appearAnchors.length > 0 && g.appearAnchors.length > 0);
        if (s) return s.appearAnchors.find(g => true);
    }
    else if (options.arrow == 'down') {
        eb = cs.last();
        for (var j = eb.bottom + GAP; j <= Math.min(window.innerHeight, bound.bottom); j = j + GAP) {
            aa = findXBlockAppear(appear, options.left || bound.right, j, bound, 'left');
            if (aa) return aa;
            aa = findXBlockAppear(appear, options.left || bound.right, j, bound, 'right');
            if (aa) return aa;
        }
        var s = appear.block.nextFind(g => g.appearAnchors.some(s => TextEle.getBounds(s.el).first()?.top >= eb.bottom));
        if (s) {
            if (s.isLine) {
                var row = s.closest(x => x.isContentBlock);
                if (row) {
                    var r = row.find(g => g.appearAnchors.some(s => TextEle.getBounds(s.el).first()?.containX(options.left) && TextEle.getBounds(s.el)?.first()?.top >= eb.bottom));
                    if (r) {
                        return r.appearAnchors.find(s => TextEle.getBounds(s.el).first()?.containX(options.left) && TextEle.getBounds(s.el)?.first()?.top >= eb.bottom)
                    }
                }
            }
            return s.appearAnchors.find(s => TextEle.getBounds(s.el).first()?.top >= eb.bottom);
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
        var s = appear.block.prevFind(g => g.appearAnchors.some(s => TextEle.getBounds(s.el)?.last()?.bottom <= eb.top));
        if (s) {
            if (s.isLine) {
                var row = s.closest(x => x.isContentBlock);
                if (row) {
                    var r = row.find(g => g.appearAnchors.some(s => TextEle.getBounds(s.el)?.last()?.containX(options.left) && TextEle.getBounds(s.el).last()?.bottom <= eb.top));
                    if (r) {
                        return r.appearAnchors.find(s => TextEle.getBounds(s.el)?.last()?.containX(options.left) && TextEle.getBounds(s.el).last()?.bottom <= eb.top)
                    }
                }
            }
            return s.appearAnchors.findLast(s => TextEle.getBounds(s.el).last()?.bottom <= eb.top);
        }
    }
}


/**
 * 这里可以通过光标自动获取光标所在的位置坐标
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
    if (en && !list.includes(en)) list.push(en);
    return list;
}

/**
 * 通过point查找在block下面相关的appear
 * 这个通常是空白处
 * @param point 
 */
export function findBlockNearAppearByPoint(block: Block, point: Point) {
    var ps: { aa: AppearAnchor, isY: boolean, dis: number }[] = [];
    block.each(b => {
        b.appearAnchors.each(aa => {
            if (aa.isSolid) {
                var isY: boolean = false;
                var dis;
                var bound = Rect.fromEle(aa.el);
                if (bound.containY(point.y))
                    isY = true;
                dis = bound.dis(point);
                ps.push({ aa, dis, isY });
            }
            else {
                var cs = TextEle.getBounds(aa.el);
                if (cs.length == 0) return;
                var isY: boolean = false;
                var dis;
                if (point.y < cs.first().top) {
                    dis = cs.first().dis(point);
                }
                else if (point.y > cs.last().bottom) {
                    dis = cs.last().dis(point);
                }
                else {
                    isY = true;
                    var r = cs.find(g => g.containY(point.y));
                    if (r) {
                        dis = r.dis(point);
                    }
                }
                ps.push({ aa, dis, isY });
            }

        })
    }, true);
    var pr: { aa: AppearAnchor, dis: number, isY: boolean };
    if (ps.findAll(g => g.isY).length > 1) {
        pr = ps.findAll(g => g.isY).findMin(g => g.dis);
    }
    else pr = ps.find(g => g.isY);
    if (!pr) {
        pr = ps.findMin(g => g.dis);
    }
    if (pr) {
        if (pr.aa.isSolid) {
            var rg = Rect.fromEle(pr.aa.el);
            if (point.x < rg.center) {
                return {
                    aa: pr.aa,
                    offset: 0
                }
            }
            else {
                return {
                    aa: pr.aa,
                    offset: 1
                }
            }
        }
        else {
            var r = pr.aa.collapseByPoint(point);
            if (r) {
                var sel = window.getSelection();
                var offset = pr.aa.getCursorOffset(sel.focusNode, sel.focusOffset);
                return {
                    aa: pr.aa,
                    offset
                }
            }
        }
    }
}