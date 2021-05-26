import { Anchor } from "../selector/selection/anchor";


 class Dom {
    el: Node;
    constructor(el: Node) {
        this.el = el;
    }
    style(attr: string, pseudoElt?: string | null) {
        if (this.el instanceof Element)
            return getComputedStyle(this.el, pseudoElt)[attr];
        else throw 'the el not computed style'
    }
    fontStyle() {
        var ele = this.el;
        try {
            var fontStyle = {
                fontStyle: this.style('fontStyle'),
                fontVariant: this.style('fontVariant'),
                fontWeight: this.style('fontWeight'),
                fontSize: this.style('fontSize'),
                lineHeight: this.style('lineHeight'),
                fontFamily: this.style('fontFamily'),
                letterSpacing: this.style('letterSpacing'),
                color: this.style('color')
            };
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
        var p = this.el.parentElement;
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
    prevFind(predict: (node: Node) => boolean, consider: boolean = false) {
        if (consider == true && predict(this.el) != true) return this.el;
        var p = this.el.previousSibling;
        var pa = this.el.parentNode;
        var rs: Node[] = [];
        while (true) {
            if (p) {
                if (predict(p) == true) return p;
                else {
                    pa = p.parentNode;
                    p = p.previousSibling;
                }
            }
            else if (pa) {
                if (pa.childNodes.length > 0 && !rs.exists(g => g == pa)) {
                    rs.push(pa);
                    var innerAfter = new Dom(pa).findInnerAfter();
                    if (innerAfter) {
                        if (predict(innerAfter)) return innerAfter;
                        else {
                            p = innerAfter.previousSibling;
                            pa = innerAfter.parentNode;
                        }
                    }
                }
                else {
                    if (pa.childNodes.length == 0 && predict(pa) == true) {
                        return pa;
                    }
                    else {
                        p = pa.previousSibling;
                        pa = pa.parentNode;
                    }
                }
            }
            else break;
        }
    }
    nextFind(predict: (node: HTMLElement) => boolean) {

    }
    findInnerAfter() {
        var p: Node = this.el;
        while (true) {
            if (p.childNodes.length > 0) { p = p.childNodes[p.childNodes.length - 1] }
            else return p;
        }
    }
    insertAfter(el: HTMLElement) {
        var p = el.parentNode;
        if (p.lastChild == el) {
            p.appendChild(this.el);
        }
        else p.insertBefore(this.el, el.nextSibling);
    }
    insertAnchor(at: number, anchor: Anchor) {
        var el = this.el;
        var index = 0;
        var isEnd: boolean = false;
        function traverseNodes(el: HTMLElement) {
            var cs: Node[] = Array.from(el.childNodes);
            cs.remove(g => {
                if (g instanceof HTMLElement && g.classList.contains('sy-anchor-appear')) return true;
                else return false;
            })
            for (let i = 0; i < cs.length; i++) {
                if (isEnd == true) break;
                var c = cs[i];
                if (c instanceof Text) {
                    var text = c.textContent || '';
                    if (text.length > 0) {
                        if (at >= index && at <= index + text.length) {
                            if (at == index) {
                                c.parentNode.insertBefore(anchor.view, c);
                            }
                            else if (at == index + text.length) {
                                if (c.nextSibling) c.parentNode.insertBefore(anchor.view, c.nextSibling)
                                else c.parentNode.appendChild(anchor.view);
                            }
                            else {
                                var frontText = text.slice(0, at - index);
                                var behindText = text.slice(at - index);
                                c.textContent = behindText;
                                c.parentNode.insertBefore(anchor.view, c);
                                var newTextNode = document.createTextNode(frontText);
                                c.parentNode.insertBefore(newTextNode, anchor.view);
                            }
                            isEnd = true;
                        }
                        else index += text.length;
                    }
                }
                else if (c instanceof HTMLBRElement) {
                    if (at == index) {
                        c.parentNode.insertBefore(anchor.view, c);
                        isEnd = true;
                    }
                    else if (at == index + 1) {
                        if (c.nextSibling) c.parentNode.insertBefore(anchor.view, c.nextSibling)
                        else c.parentNode.appendChild(anchor.view);
                        isEnd = true;
                    }
                    else index += 1;
                }
                else {
                    if (c.childNodes.length > 0 && !isEnd) traverseNodes(c as HTMLElement);
                }
            }
        }
        if (at == 0 && this.el.childNodes.length == 0) {
            this.el.appendChild(anchor.view);
        }
        else traverseNodes(el as HTMLElement);
        function combineText(el: Node) {
            var current = el.firstChild;
            while (true) {
                if (!current) break;
                var next = current.nextSibling;
                if (!next) break;
                if (current instanceof Text && next instanceof Text) {
                    next.textContent = current.textContent + next.textContent;
                    current.remove();
                    current = next;
                }
                else {
                    if (current.childNodes.length > 0) {
                        combineText(current);
                    }
                    current = next;
                }
            }
        }
        combineText(el);
    }
    removeClass(predict: (cla: string) => boolean) {
        var cs = Array.from((this.el as HTMLElement).classList);
        var c = cs.findAll(predict);
        c.each(g => {
            (this.el as HTMLElement).classList.remove(g);
        })
    }
}

export var dom = function (el: HTMLElement) {
    return new Dom(el);
}