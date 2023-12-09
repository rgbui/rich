
import { Matrix } from "./matrix";
import { Point } from "./vector/point";

class Dom {
    el: Node;
    constructor(el: Node) {
        this.el = el;
    }
    style(attr: string, pseudoElt?: string | null) {
        if (this.el instanceof Text) {
            return null;
        }
        if (this.el instanceof HTMLElement) {
            try {
                var sp = getComputedStyle(this.el as HTMLElement, pseudoElt || null);
                return sp[attr];
                // return sp.getPropertyValue(attr);
            }
            catch (ex) {
                console.error(ex, this.el);
                console.warn('not el computed style')
                return null;
            }
        }
        return null;
    }
    lineHeight(def?: number) {
        try {
            return parseInt(this.style('lineHeight').replace('px', ''))
        }
        catch (ex) {
            return def;
        }
    }
    fontStyle() {
        var ele = this.el;
        try {
            var fontStyle = {
                fontStyle: this.style('fontStyle'),
                fontVariant: this.style('fontVariant'),
                fontWeight: this.style('fontWeight'),
                fontSize: this.style('fontSize'),
                lineHeight: this.style('lineHeight') as any,
                fontFamily: this.style('fontFamily'),
                letterSpacing: this.style('letterSpacing') as any,
                color: this.style('color')
            };
            if (typeof fontStyle.lineHeight == 'string')
                fontStyle.lineHeight = parseInt(fontStyle.lineHeight.replace('px', ''));
            fontStyle.letterSpacing = parseInt(fontStyle.letterSpacing.replace('px', ''));
            if (isNaN(fontStyle.letterSpacing)) fontStyle.letterSpacing = 0;
            return fontStyle;
        } catch (e) {
            throw e;
        }
    }
    closest(predict: (node: Node) => boolean, ignore: boolean = false) {
        if (ignore == false && predict(this.el) == true) return this.el;
        var p = this.el?.parentElement;
        while (true) {
            if (p) {
                if (predict(p)) return p;
                else p = p.parentElement;
            }
            else break;
        }
    }
    parents(predict: (node: Node) => boolean, consider: boolean = false) {
        var els: Node[] = [];
        if (consider == true && predict(this.el)) { els.push(this.el) }
        var p = this.el.parentElement;
        while (true) {
            if (p) {
                if (predict(p)) { els.push(this.el) }
                else p = p.parentElement;
            }
            else break;
        }
    }
    prevFind(predict: (block: Node) => boolean, consider: boolean = false, finalPredict?: (block: Node) => boolean) {
        var isFinal: boolean = false;
        function _find(block: Node, consider: boolean = false) {
            var bl: Node;
            dom(block as HTMLElement).eachReverse(r => {
                if (typeof finalPredict == 'function' && finalPredict(r) == true) { isFinal = true; return false; }
                if (predict(r) == true) {
                    bl = r;
                    return false;
                }
            }, consider);
            return bl;
        }
        if (consider == true) {
            var r = _find(this.el, true);
            if (r) return r;
        }
        if (isFinal) return;
        function prevParentFind(block: Node) {
            var pa = block.parentNode;
            if (pa) {
                var rs = Array.from(pa.childNodes);
                var at = rs.findIndex(g => g === block);
                for (let i = at - 1; i > -1; i--) {
                    var r = _find(rs[i], true);
                    if (r) return r;
                    if (isFinal) return;
                }
                if (typeof finalPredict == 'function' && finalPredict(pa) == true) return;
                if (predict(pa) == true) return pa;
                var g = prevParentFind(pa);
                if (g) return g;
            }
        }
        return prevParentFind(this.el);
    }
    nextFind(predict: (block: Node) => boolean, consider: boolean = false, finalPredict?: (block: Node) => boolean) {
        var isFinal: boolean = false;
        function _find(block: Node, consider: boolean = false) {
            var bl: Node;
            dom(block as HTMLElement).each(r => {
                if (typeof finalPredict == 'function' && finalPredict(r) == true) { isFinal = true; return false; }
                if (predict(r) == true) {
                    bl = r;
                    return false;
                }
            }, consider);
            return bl;
        }
        if (consider == true) {
            var r = _find(this.el, true);
            if (r) return r;
        }
        if (isFinal) return;
        function prevParentFind(block: Node) {
            var pa = block.parentNode;
            if (pa) {
                var rs = Array.from(pa.childNodes);
                var at = rs.findIndex(g => g === block);
                for (let i = at + 1; i < rs.length; i++) {
                    var r = _find(rs[i], true);
                    if (r) return r;
                    if (isFinal) return;
                }
                if (typeof finalPredict == 'function' && finalPredict(pa) == true) return;
                if (predict(pa) == true) return pa;
                var g = prevParentFind(pa);
                if (g) return g;
            }
        }
        return prevParentFind(this.el);
    }
    insertAfter(el: HTMLElement) {
        var p = el.parentNode;
        if (p.lastChild == el) {
            p.appendChild(this.el);
        }
        else p.insertBefore(this.el, el.nextSibling);
    }
    removeClass(predict: (cla: string) => boolean) {
        var cs = Array.from((this.el as HTMLElement).classList);
        var c = cs.findAll(predict);
        c.each(g => {
            (this.el as HTMLElement).classList.remove(g);
        })
    }
    each(predict: (block: Node) => false | -1 | void, conside: boolean = false, isDepth = false) {
        function _each(block: Node) {
            var isBreak: boolean = false;
            for (let i = 0; i < block.childNodes.length; i++) {
                if (isBreak) break;
                var node = block.childNodes[i];
                if (isDepth == true) {
                    if (_each(node) == true) { isBreak = true; break; }
                    var r = predict(node);
                    if (r === false) { isBreak = true; break };
                }
                else {
                    var r = predict(node);
                    if (r === false) { isBreak = true; break }
                    else if (r === -1) continue;
                    if (_each(node) == true) { isBreak = true; break; }
                }
            }
            return isBreak;
        }
        if (isDepth == true) {
            if (_each(this.el) == true) return;
            if (conside == true && predict(this.el) == false) return;
        }
        else {
            if (conside == true && predict(this.el) == false) return;
            _each(this.el);
        }
    }
    /**
   * 
   * @param this 
   * @param predict  返回false 表示不在循环了 返回-1 表示不在进入子元素了 
   * @param consider 
   * @param isDepth 
   * @returns 
   */
    eachReverse(predict: (Block: Node) => false | -1 | void, conside: boolean = false, isDepth = false) {
        function _each(block: Node) {
            var isBreak: boolean = false;
            for (let i = block.childNodes.length - 1; i > -1; i--) {
                if (isBreak) break;
                var node = block.childNodes[i];
                if (isDepth == true) {
                    if (_each(node) == true) { isBreak = true; break; }
                    var r = predict(node);
                    if (r === false) { isBreak = true; break };
                }
                else {
                    var r = predict(node);
                    if (r === false) { isBreak = true; break }
                    else if (r === -1) continue;
                    if (_each(node) == true) { isBreak = true; break; }
                }
            }
            return isBreak;
        }
        if (isDepth == true) {
            if (_each(this.el) == true) return;
            if (conside == true && predict(this.el) == false) return;
        }
        else {
            if (conside == true && predict(this.el) == false) return;
            _each(this.el);
        }
    }
    /***
    * 这是从里面最开始的查询
    */
    find(predict: (block: Node) => boolean,
        consider: boolean = false,
        finalPredict?: (block: Node) => boolean, isDepth = false): Node {
        var block: Node;
        this.each(r => {
            if (typeof finalPredict == 'function' && finalPredict(r) == true) return false;
            if (predict(r) == true) {
                block = r;
                return false;
            }
        }, consider, isDepth);
        return block;
    }
    findReverse(predict: (block: Node) => boolean, consider: boolean = false,
        finalPredict?: (block: Node) => boolean, isDepth = false) {
        var block: Node;
        this.eachReverse(r => {
            if (typeof finalPredict == 'function' && finalPredict(r) == true) return false;
            if (predict(r) == true) {
                block = r;
                return false;
            }
        }, consider, isDepth);
        return block;
    }
    removeEmptyNode() {
        var pa = this.el.parentNode;
        (this.el as HTMLElement).remove()
        while (true) {
            if (pa.childNodes.length == 0) {
                var pn = pa.parentNode;
                (pa as HTMLElement).remove();
                if (pn) pa = pn;
                else break;
            }
            else break;
        }
    }
    isScrollBottom(dis: number) {
        var element = this.el as HTMLElement;
        var d = element.scrollHeight - element.scrollTop;
        if (element.scrollTop + element.clientHeight + dis > element.scrollHeight)
            return true;
        else return false;
    }
    /**
 * 获取元素的css3 Translate偏移量
 * 只做了对标准和webkit内核兼容
 * 获取css属性摘自Zepto.js，做修改后只获得transform属性
 * 只处理 translate，如果有旋转或者缩放等，结果会不准确
 *
 * @param  {Object} element dom元素
 * @return {Array}          偏移量[x,y]
 */
    getMatrix() {
        var matrixString = getComputedStyle(this.el as HTMLElement).transform;
        var matrixPoints = Array.from(matrixString.match(/\-?[0-9]+\.?[0-9]*/g)).map(c => { return parseFloat(c) });
        return new Matrix(...matrixPoints)
    }
    getOverflowPanel() {
        var predict = x => { return dom(x as HTMLElement).style('overflowY') == 'auto' || dom(x as HTMLElement).style('overflowX') == 'auto' || dom(x as HTMLElement).style('overflowY') == 'overlay' || dom(x as HTMLElement).style('overflowX') == 'overlay' }
        var scrollDiv: HTMLElement = this.closest(predict) as any;
        return scrollDiv;
    }
    findOverflowPanel() {
        var predict = x => { return dom(x as HTMLElement).style('overflowY') == 'auto' || dom(x as HTMLElement).style('overflowX') == 'auto' || dom(x as HTMLElement).style('overflowY') == 'overlay' || dom(x as HTMLElement).style('overflowX') == 'overlay' }
        var scrollDiv: HTMLElement = this.find(predict) as any;
        return scrollDiv;
    }
}

export var dom = function (el: Node) {
    return new Dom(el);
}



/**
 * 
 * https://www.zhangxinxu.com/wordpress/2019/03/dom-contains-comparedocumentposition/
 * 
 * @param el 
 * @param comprareEl 
 * @returns 
 */
export function elIsBefore(el: Node, comprareEl: Node) {
    var compareValue = el.compareDocumentPosition(comprareEl);
    if (compareValue == 2) {
        // compareImg在前
        return false;
    } else if (compareValue == 4) {
        // compareImg在后
        return true;
    } else if (compareValue == 0) {
        // 就是compareImg元素自身
        return null;
    } else {
        // 其它位置关系
        return null;
    }
}


export function domVisibleSeek(options: {
    point: Point,
    step: number,
    arrow: 'down' | 'up' | 'left' | 'right',
    range?: HTMLElement,
    predict: (el: HTMLElement) => boolean
}) {
    var current: Point = options.point.clone();
    while (true) {
        var el = document.elementFromPoint(current.x, current.y);
        if (!el) return
        if (options.range && !options.range.contains(el)) return;
        if (options.predict(el as HTMLElement)) return el;
        else {
            if (options.arrow == 'down')
                current = current.move(0, options.step);
            else if (options.arrow == 'up')
                current = current.move(0, 0 - options.step)
            else if (options.arrow == 'left')
                current = current.move(0 - options.step, 0)
            else current = current.move(options.step, 0)
        }
    }
}