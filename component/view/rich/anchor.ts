// export class Anchor {
//     root: HTMLElement;
//     start: AnchorPos;
//     end: AnchorPos;
//     focus: AnchorPos;
//     isCross: boolean = false;
//     isCollapsed: boolean;
//     split(anchor: AnchorPos) {
//         var befores: HTMLElement[] = [];
//         var afters: HTMLElement[] = [];
//         if (anchor.text) {
//             var newText: HTMLElement;
//             var cs = Array.from(anchor.block.childNodes) as HTMLElement[];
//             var current = anchor.lineBlock || anchor.text;
//             var at = cs.findIndex(g => g === current);
//             if (anchor.offset == 0) {
//                 befores = cs.findAll((c, i) => i < at);
//                 afters = cs.findAll((c, i) => i >= at);
//             }
//             else if (anchor.offset == anchor.text?.textContent.length) {
//                 befores = cs.findAll((c, i) => i <= at);
//                 afters = cs.findAll((c, i) => i > at);
//             }
//             else {
//                 befores = cs.findAll((c, i) => i <= at);
//                 afters = cs.findAll((c, i) => i > at);
//                 var t = anchor.text.textContent;
//                 anchor.text.textContent = t.slice(0, anchor.offset);
//                 var rest = t.slice(anchor.offset);
//                 if (anchor.lineBlock) {
//                     var sp = anchor.lineBlock.cloneNode(true) as HTMLElement;
//                     sp.innerText = rest;
//                     newText = sp as any;
//                 }
//                 else if (anchor.text) {
//                     newText = document.createTextNode(rest) as any;
//                 }
//                 anchor.block.insertBefore(newText, afters[0]);
//                 afters.splice(0, 0, newText as any);
//             }
//             return {
//                 befores,
//                 afters,
//                 newText
//             }
//         }
//         else {
//             return {
//                 befores,
//                 afters
//             }
//         }
//     }
//     sps() {
//         var sps: HTMLElement[] = [];
//         if (this.start.block === this.end.block) {
//             if (this.start.text === this.end.text) {
//                 var text = this.start.text.textContent;
//                 var nt = text.slice(this.start.offset, this.end.offset);
//                 var rest = text.slice(this.end.offset);
//                 var newNode;
//                 if (this.start.lineBlock) {
//                     var c = this.start.lineBlock.cloneNode(true);
//                     (c as HTMLElement).innerText = nt;
//                     this.start.lineBlock.parentNode.insertBefore(c, this.start.lineBlock.nextSibling);
//                     newNode = c;
//                 }
//                 else {
//                     c = document.createTextNode(nt);
//                     this.start.text.parentNode.insertBefore(c, this.start.text.nextSibling);
//                     newNode = c;
//                 }
//                 sps.push(newNode);
//                 if (rest) {
//                     if (this.start.lineBlock) {
//                         var c = this.start.lineBlock.cloneNode(true);
//                         (c as HTMLElement).innerText = rest;
//                         newNode.parentNode.insertBefore(c, newNode.nextSibling);
//                     }
//                     else {
//                         c = document.createTextNode(rest);
//                         newNode.parentNode.insertBefore(c, newNode.nextSibling);
//                     }
//                 }
//             }
//             else {
//                 var cs = Array.from(this.start.block.childNodes);
//                 var isIn: boolean = false;
//                 for (let i = 0; i < cs.length; i++) {
//                     var lineBlock = cs[i];
//                     if (lineBlock === this.start.lineBlock && this.start.lineBlock || this.start.text && this.start.text === lineBlock) {
//                         if (this.start.offset == 0) {
//                             sps.push(lineBlock as HTMLElement);
//                         }
//                         else if (this.start.offset < this.start.text.textContent.length) {
//                             var te = this.start.text.textContent;
//                             var oldText = te.slice(0, this.start.offset);
//                             var newText = te.slice(this.start.offset);
//                             this.start.text.textContent = oldText;
//                             if (this.start.lineBlock) {
//                                 var ts = this.start.lineBlock.cloneNode(true) as HTMLElement;
//                                 ts.innerText = newText;
//                                 this.start.lineBlock.parentNode.insertBefore(ts, this.start.lineBlock.nextSibling);
//                                 sps.push(ts);
//                             }
//                             else {
//                                 var tn = document.createTextNode(newText) as Text;
//                                 this.start.text.parentNode.insertBefore(tn, this.start.text.nextSibling);
//                                 sps.push(tn as any);
//                             }
//                         }
//                         isIn = true;
//                     }
//                     else if (lineBlock === this.end.lineBlock && this.end.lineBlock || this.end.text && this.end.text === lineBlock) {
//                         if (this.end.offset > 0) {
//                             if (this.end.offset < this.end.text.textContent.length) {
//                                 var te = this.end.text.textContent;
//                                 var oldText = te.slice(0, this.end.offset);
//                                 var newText = te.slice(this.end.offset);
//                                 this.end.text.textContent = newText;
//                                 if (this.end.lineBlock) {
//                                     var ts = this.end.lineBlock.cloneNode(true) as HTMLElement;
//                                     ts.innerText = oldText;
//                                     this.end.lineBlock.parentNode.insertBefore(ts, this.end.lineBlock.nextSibling);
//                                     sps.push(ts);
//                                 }
//                                 else {
//                                     var tn = document.createTextNode(oldText) as Text;
//                                     this.end.text.parentNode.insertBefore(tn, this.end.text.nextSibling);
//                                     sps.push(tn as any);
//                                 }
//                             }
//                             else if (this.end.offset == this.end.text.textContent.length) {
//                                 sps.push(lineBlock as any);
//                             }
//                         }
//                         isIn = false;
//                     }
//                     else if (isIn) {
//                         sps.push(lineBlock as HTMLElement)
//                     }
//                 }
//             }
//         }
//         else {
//             var s = this.split(this.start);
//             if (s.afters.length > 0) s.afters.forEach(af => sps.push(af));
//             var ne = this.start.block.nextElementSibling;
//             while (true) {
//                 if (ne && ne !== this.end.block) {
//                     var cs = Array.from(ne.childNodes);
//                     cs.forEach(c => sps.push(c as HTMLElement))
//                     ne = ne.nextElementSibling;
//                 }
//                 else break;
//             }
//             var e = this.split(this.end);
//             if (e.befores.length > 0) e.befores.forEach(e => sps.push(e));
//         }
//         return sps;
//     }
//     static create(root: HTMLElement) {
//         var anchor = new Anchor();
//         anchor.root = root;
//         var sel = window.getSelection();
//         anchor.isCollapsed = sel.isCollapsed;
//         if (sel.isCollapsed) {
//             anchor.start = this.getAnchorPos(sel.focusNode as HTMLElement, sel.focusOffset, root);
//             anchor.focus = anchor.start;
//         }
//         else {
//             var sn = sel.anchorNode;
//             var so = sel.anchorOffset;
//             var en = sel.focusNode;
//             var eo = sel.focusOffset;
//             var isChange: boolean = false;
//             if (sn === en && so > eo) {
//                 [sn, en] = [en, sn];
//                 [so, eo] = [eo, so];
//                 isChange = true;
//             }
//             else if (Anchor.isBefore(sn, en)) {
//                 [sn, en] = [en, sn];
//                 [so, eo] = [eo, so];
//                 isChange = true;
//             }
//             anchor.start = this.getAnchorPos(sn as HTMLElement, so, root);
//             anchor.end = this.getAnchorPos(en as HTMLElement, eo, root);
//             if (isChange) anchor.focus = anchor.start;
//             else anchor.focus = anchor.end;
//             if (anchor.start.block !== anchor.end.block) anchor.isCross = true;
//         }
//         return anchor;
//     }
//     private static getAnchorPos(el: HTMLElement | Text, offset: number, root: HTMLElement) {
//         var pos: AnchorPos = {
//             target: el as HTMLElement,
//             block: ((el instanceof Text ? el.parentNode : el) as HTMLElement).closest('p'),
//             offset,
//             text: (el instanceof Text) ? el : undefined,
//             span: ((el instanceof Text ? el.parentNode : el) as HTMLElement).closest('span'),
//             a: ((el instanceof Text ? el.parentNode : el) as HTMLElement).closest('a'),
//         } as any;
//         pos.lineBlock = (pos.a || pos.span) as HTMLElement;
//         if (!pos.block) { pos.isBlockRoot = true; pos.block = root; }
//         if (typeof pos.isBlockRoot == 'undefined')
//             pos.isBlockRoot = pos.block == root || el === root ? true : false;
//         return pos;
//     }
//     // static style(el, attr: string, pseudoElt?: string | null) {
//     //     if (el instanceof Text) {
//     //         return null;
//     //     }
//     //     try {
//     //         return getComputedStyle(el as HTMLElement, pseudoElt)[attr];
//     //     }
//     //     catch (ex) {
//     //         console.error(ex);
//     //         console.warn('not el computed style')
//     //         return null;
//     //     }
//     // }
//     // getStyle() {
//     //     var sps = this.sps();
//     //     if (sps.length == 0) return {}
//     //     var style: Record<string, any> = getNodeStyle(sps[0]);
//     //     var getNodeStyle = (node: HTMLElement) => {
//     //         var json = {} as Record<string, any>;
//     //         json['fontWeight'] = Anchor.style(node, 'fontWeight');
//     //         return json;
//     //     }
//     //     for (let i = 1; i < sps.length; i++) {
//     //         var dj = getNodeStyle(sps[i]);
//     //         for (let n in style) {
//     //             if (lodash.isNull(dj[n]) || lodash.isUndefined(dj[n]) || !lodash.isEqual(dj[n], style[n])) {
//     //                 delete style[n];
//     //             }
//     //         }
//     //         if (Object.keys(style).length == 0) break;
//     //     }
//     //     return style;
//     // }
//     static findPre(el: HTMLElement) {
//         if (el.previousSibling) return el.previousSibling;
//         if (el instanceof Text && el.parentNode.previousSibling) return el.parentNode.previousSibling;
//         var p = el.closest('p');
//         if (p) {
//             var preP = p.previousElementSibling;
//             if (preP) {
//                 var cs = Array.from(preP.childNodes);
//                 if (cs.length > 0)
//                     return cs[cs.length - 1]
//             }
//         }

//     }
//     static findNext(el: HTMLElement) {
//         if (el.nextSibling) return el.nextSibling;
//         if (el instanceof Text && el.parentNode.nextSibling) return el.parentNode.nextSibling;
//         var p = el.closest('p');
//         if (p) {
//             var preP = p.nextElementSibling;
//             if (preP) {
//                 var cs = Array.from(preP.childNodes);
//                 if (cs.length > 0)
//                     return cs[0]
//             }
//         }

//     }
//     static isBefore(start, end) {
//         var pos = start.compareDocumentPosition(end);
//         if (pos == 4 || pos == 20) {
//             return true
//         }
//         return false
//     }
// }

// type AnchorPos = {
//     offset: number,
//     text: Text,
//     a: HTMLElement,
//     span: HTMLElement,
//     target: HTMLElement,
//     lineBlock: HTMLElement,
//     block: HTMLElement,
//     isBlockRoot: boolean
//     // p: HTMLElement,
//     // target: HTMLElement,
//     // current: HTMLElement,
//     // text: Text,
//     // span: HTMLElement,
//     // a: HTMLElement,
//     // isPAfter: boolean,
//     // offset: number
// }