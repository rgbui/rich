import lodash from "lodash";
import { TextEle } from "../../../src/common/text.ele";

export class Anchor {
    root: HTMLElement;
    start: AnchorPos;
    end: AnchorPos;
    focus: AnchorPos;
    isCross: boolean = false;
    isCollapsed: boolean;
    split(anchor: AnchorPos) {
        var befores: HTMLElement[] = [];
        var afters: HTMLElement[] = [];
        if (anchor.text) {
            var newText: HTMLElement;
            var cs = Array.from(anchor.block.childNodes) as HTMLElement[];
            var current = anchor.lineBlock || anchor.text;
            var at = cs.findIndex(g => g === current);
            if (anchor.offset == 0) {
                befores = cs.findAll((c, i) => i < at);
                afters = cs.findAll((c, i) => i >= at);
            }
            else if (anchor.offset == anchor.text?.textContent.length) {
                befores = cs.findAll((c, i) => i <= at);
                afters = cs.findAll((c, i) => i > at);
            }
            else {
                befores = cs.findAll((c, i) => i <= at);
                afters = cs.findAll((c, i) => i > at);
                var t = anchor.text.textContent;
                anchor.text.textContent = t.slice(0, anchor.offset);
                var rest = t.slice(anchor.offset);
                if (anchor.span || anchor.a) {
                    var sp = (anchor.span || anchor.a).cloneNode(true) as HTMLElement;
                    sp.innerText = rest;
                    newText = sp as any;
                }
                else if (anchor.text) {
                    newText = document.createTextNode(rest) as any;
                }
                anchor.block.insertBefore(newText, afters[0]);
                afters.splice(0, 0, newText as any);
            }
            return {
                befores,
                afters,
                newText
            }
        }
        else {
            return {
                befores,
                afters
            }
        }
    }
    lineBetween() {
        // var befores: HTMLElement[] = [];
        // var afters: HTMLElement[] = [];
        // var middles: HTMLElement[] = [];
        // if (this.isCollapsed) {
        //     var c = this.split(this.start);
        //     return {
        //         ...c,
        //         middles
        //     }
        // }
        // else {
        //     var cs = Array.from(this.start.p.childNodes) as HTMLElement[];
        //     var sat = cs.findIndex(g => g === this.start.current);
        //     var eat = cs.findIndex(g => g == this.end.current);
        //     befores = cs.findAll((c, i) => i < sat);
        //     afters = cs.findAll((c, i) => i > eat);
        //     middles = cs.findAll((c, i) => i > sat && i < eat);
        //     if (this.start.current === this.end.current) {
        //         if (this.start.offset == 0 && this.end.offset == this.end?.text.textContent.length) {
        //             middles.push(this.start.current);
        //         }
        //         else if (this.start.offset > 0 && this.end.offset == this.end?.text.textContent.length) {
        //             var tc = this.start.text.textContent;
        //             this.start.text.textContent = tc.slice(0, this.start.offset);
        //             befores.push(this.start.current);
        //             var rest = tc.slice(this.start.offset);
        //             if (this.start.a || this.start.span) {
        //                 var nc = (this.start.a || this.start.span).cloneNode(true) as HTMLElement;
        //                 nc.innerText = rest;
        //                 this.start.current.parentNode.insertBefore(nc, this.start.current.nextSibling);
        //                 middles.splice(0, 0, nc);
        //             }
        //             else {
        //                 var newT = document.createTextNode(rest);
        //                 this.start.target.parentNode.insertBefore(newT, this.start.target.nextSibling);
        //                 middles.splice(0, 0, newT as any);
        //             }
        //         } else if (this.start.offset == 0 && this.end.offset < this.end?.text.textContent.length) {
        //             var tc = this.end.text.textContent;
        //             this.end.text.textContent = tc.slice(0, this.end.offset);
        //             middles.push(this.end.current);
        //             var rest = tc.slice(this.end.offset);
        //             if (this.end.a || this.end.span) {
        //                 var nc = (this.end.a || this.end.span).cloneNode(true) as HTMLElement;
        //                 nc.innerText = rest;
        //                 this.end.current.parentNode.insertBefore(nc, this.end.current.nextSibling);
        //                 afters.splice(0, 0, nc);
        //             }
        //             else {
        //                 var newT = document.createTextNode(rest);
        //                 this.end.target.parentNode.insertBefore(newT, this.end.target.nextSibling);
        //                 afters.splice(0, 0, newT as any);
        //             }
        //         }
        //         else {
        //             var tc = this.start.text.textContent;
        //             this.start.text.textContent = tc.slice(0, this.start.offset);
        //             befores.push(this.start.current);
        //             var middle = tc.slice(this.start.offset, this.end.offset);
        //             var rest = tc.slice(this.end.offset);
        //             if (this.start.a || this.start.span) {
        //                 var nc = (this.start.a || this.start.span).cloneNode(true) as HTMLElement;
        //                 nc.innerText = middle;
        //                 this.start.current.parentNode.insertBefore(nc, this.start.current.nextSibling);
        //                 middles.splice(0, 0, nc);

        //                 var rT = (this.start.a || this.start.span).cloneNode(true) as HTMLElement;
        //                 rT.innerText = rest;
        //                 this.start.current.parentNode.insertBefore(nc, nc.nextSibling);
        //                 afters.splice(0, 0, rT);
        //             }
        //             else {
        //                 var newT = document.createTextNode(middle);
        //                 this.start.target.parentNode.insertBefore(newT, this.start.target.nextSibling);
        //                 middles.splice(0, 0, newT as any);

        //                 var restT = document.createTextNode(rest);
        //                 this.start.target.parentNode.insertBefore(restT, newT.nextSibling);
        //                 afters.splice(0, 0, newT as any);
        //             }
        //         }
        //     }
        //     else {
        //         if (this.start.offset == 0) {
        //             middles.splice(0, 0, this.start.current)
        //         }
        //         else if (this.start.offset == this.start?.text.textContent.length) {
        //             befores.push(this.start.current);
        //         }
        //         else {
        //             var tc = this.start.text.textContent;
        //             this.start.text.textContent = tc.slice(0, this.start.offset);
        //             befores.push(this.start.current);
        //             var rest = tc.slice(this.start.offset);
        //             if (this.start.a || this.start.span) {
        //                 var nc = (this.start.a || this.start.span).cloneNode(true) as HTMLElement;
        //                 nc.innerText = rest;
        //                 this.start.current.parentNode.insertBefore(nc, this.start.current.nextSibling);
        //                 middles.splice(0, 0, nc);
        //             }
        //             else {
        //                 var newT = document.createTextNode(rest);
        //                 this.start.target.parentNode.insertBefore(newT, this.start.target.nextSibling);
        //                 middles.splice(0, 0, newT as any);
        //             }
        //         }
        //         if (this.end.offset == 0) {
        //             afters.splice(0, 0, this.end.current);
        //         }
        //         else if (this.end.offset == this.end?.text.textContent.length) {
        //             middles.push(this.end.current);
        //         }
        //         else {
        //             var tc = this.end.text.textContent;
        //             this.end.text.textContent = tc.slice(0, this.end.offset);
        //             middles.push(this.end.current);
        //             var rest = tc.slice(this.end.offset);
        //             if (this.end.a || this.end.span) {
        //                 var nc = (this.end.a || this.end.span).cloneNode(true) as HTMLElement;
        //                 nc.innerText = rest;
        //                 this.end.current.parentNode.insertBefore(nc, this.end.current.nextSibling);
        //                 afters.splice(0, 0, nc);
        //             }
        //             else {
        //                 var newT = document.createTextNode(rest);
        //                 this.end.target.parentNode.insertBefore(newT, this.end.target.nextSibling);
        //                 afters.splice(0, 0, newT as any);
        //             }
        //         }
        //     }
        //     return {
        //         afters,
        //         befores,
        //         middles
        //     }
        // }
    }
    delete() {
        // if (this.isCross) {
        //     var ps = this.middlePs();
        //     ps.forEach(p => p.remove());
        //     var f = this.split(this.start);
        //     if (f.afters.length > 0) f.afters.forEach(a => a.remove())
        //     var n = this.split(this.end);
        //     if (n.befores.length > 0) n.befores.forEach(a => a.remove());
        //     return {
        //         node: n.afters[0] || this.end.p,
        //         offset: 0
        //     }
        // }
        // else {
        //     if (this.start.target === this.end.target) {
        //         var c = this.start.text.textContent;
        //         var g = c.slice(0, this.start.offset) + c.slice(this.end.offset);
        //         this.start.text.textContent = g;
        //         return {
        //             node: this.start.text,
        //             offset: this.start.offset
        //         }
        //     }
        //     else {
        //         var cs = Array.from(this.start.p.childNodes);
        //         var isIn: boolean = false;
        //         var ns: (HTMLElement | Text)[] = [];
        //         for (let i = 0; i < cs.length; i++) {
        //             var e = cs[i];
        //             var ec = !(e instanceof Text) ? e.childNodes[0] : undefined;
        //             if (e === this.start.target || ec === this.start.target) {
        //                 isIn = true;
        //             }
        //             else if (e === this.end.target || ec === this.end.target) {
        //                 isIn = true;
        //             }
        //             else {
        //                 if (isIn) {
        //                     ns.push(e as HTMLElement);
        //                 }
        //             }
        //         }
        //         var ts = this.start.text.textContent;
        //         this.start.text.textContent = ts.slice(0, this.start.offset);
        //         ns.forEach(n => n.remove())
        //         var es = this.end.text.textContent;
        //         this.end.text.textContent = es.slice(this.end.offset);
        //         return {
        //             node: this.end.text,
        //             offset: 0
        //         }
        //     }
        // }
    }
    deleteAnchor() {
        // var n = this.delete();
        // var sel = window.getSelection();
        // sel.collapse(n.node, n.offset);
        // var newAnchor = Anchor.create(this.root);
        // ['start', 'end', 'focus', 'isCross', 'isCollapsed'].forEach(c => this[c] = newAnchor[c])
    }
    middlePs() {
        // var ps: HTMLElement[] = [];
        // var ne = this.start.p.nextElementSibling as HTMLElement;
        // while (true) {
        //     if (ne && ne != this.end.p) {
        //         ps.push(ne);
        //         ne = ne.nextElementSibling as HTMLElement;
        //     }
        //     else break;
        // }
        // return ps;
    }
    sps() {
        // if (this.isCross) {
        //     var gs: HTMLElement[] = [];
        //     var c = this.split(this.start);
        //     c.afters.forEach(af => gs.push(af));
        //     var m = this.middlePs();
        //     m.forEach(c => {
        //         gs.push(...(Array.from(c.childNodes) as HTMLElement[]));
        //     })
        //     var e = this.split(this.end);
        //     e.befores.forEach(ef => gs.push(ef));
        //     return gs;
        // }
        // else return this.lineBetween().middles;
    }
    static create(root: HTMLElement) {
        var anchor = new Anchor();
        anchor.root = root;
        var sel = window.getSelection();
        anchor.isCollapsed = sel.isCollapsed;
        if (sel.isCollapsed) {
            anchor.start = this.getAnchorPos(sel.focusNode as HTMLElement, sel.focusOffset, root);
            anchor.focus = anchor.start;
        }
        else {
            var sn = sel.anchorNode;
            var so = sel.anchorOffset;
            var en = sel.focusNode;
            var eo = sel.focusOffset;
            var isChange: boolean = false;
            if (sn === en && so > eo) {
                [sn, en] = [en, sn];
                [so, eo] = [eo, so];
                isChange = true;
            }
            else if (TextEle.isBefore(sn, en)) {
                [sn, en] = [en, sn];
                [so, eo] = [eo, so];
                isChange = true;
            }
            anchor.start = this.getAnchorPos(sn as HTMLElement, so, root);
            anchor.end = this.getAnchorPos(en as HTMLElement, eo, root);
            if (isChange) anchor.focus = anchor.start;
            else anchor.focus = anchor.end;
            if (anchor.start.block !== anchor.end.block) anchor.isCross = true;
        }
        return anchor;
    }
    private static getAnchorPos(el: HTMLElement | Text, offset: number, root: HTMLElement) {
        var pos: AnchorPos = {
            target: el as HTMLElement,
            block: ((el instanceof Text ? el.parentNode : el) as HTMLElement).closest('p'),
            offset,
            text: (el instanceof Text) ? el : undefined,
            span: ((el instanceof Text ? el.parentNode : el) as HTMLElement).closest('span'),
            a: ((el instanceof Text ? el.parentNode : el) as HTMLElement).closest('a'),
        } as any;
        pos.lineBlock = (pos.a || pos.span) as HTMLElement;
        if (!pos.block) { pos.isBlockRoot = true; pos.block = el.parentNode as HTMLElement; }
        if (typeof pos.isBlockRoot == 'undefined')
            pos.isBlockRoot = pos.block == root || el === root ? true : false;
        return pos;
    }
    // static style(el, attr: string, pseudoElt?: string | null) {
    //     if (el instanceof Text) {
    //         return null;
    //     }
    //     try {
    //         return getComputedStyle(el as HTMLElement, pseudoElt)[attr];
    //     }
    //     catch (ex) {
    //         console.error(ex);
    //         console.warn('not el computed style')
    //         return null;
    //     }
    // }
    // getStyle() {
    //     var sps = this.sps();
    //     if (sps.length == 0) return {}
    //     var style: Record<string, any> = getNodeStyle(sps[0]);
    //     var getNodeStyle = (node: HTMLElement) => {
    //         var json = {} as Record<string, any>;
    //         json['fontWeight'] = Anchor.style(node, 'fontWeight');
    //         return json;
    //     }
    //     for (let i = 1; i < sps.length; i++) {
    //         var dj = getNodeStyle(sps[i]);
    //         for (let n in style) {
    //             if (lodash.isNull(dj[n]) || lodash.isUndefined(dj[n]) || !lodash.isEqual(dj[n], style[n])) {
    //                 delete style[n];
    //             }
    //         }
    //         if (Object.keys(style).length == 0) break;
    //     }
    //     return style;
    // }
}

type AnchorPos = {
    offset: number,
    text: Text,
    a: HTMLElement,
    span: HTMLElement,
    target: HTMLElement,
    lineBlock: HTMLElement,
    block: HTMLElement,
    isBlockRoot: boolean
    // p: HTMLElement,
    // target: HTMLElement,
    // current: HTMLElement,
    // text: Text,
    // span: HTMLElement,
    // a: HTMLElement,
    // isPAfter: boolean,
    // offset: number
}