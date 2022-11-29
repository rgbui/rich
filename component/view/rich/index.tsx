
import React, { CSSProperties } from "react";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { TextEle } from "../../../src/common/text.ele";
import { Rect } from "../../../src/common/vector/point";
import { UserBasic } from "../../../types/user";
import { RichPop } from "./pop";
import { RichTool } from "./tool";
import "./style.less";
import lodash from "lodash";

/**
 * 
 * rich format:
 * text
 * <p><span></span></p>
 *  
 */
export class RichView extends React.Component<{
    placeholder?: string,
    disabled?: boolean,
    readonly?: boolean,
    value?: string,
    onInput?: (value: string) => void,
    allowNewLine?: boolean,
    height?: number,
    spellCheck?: boolean,
    onPasteFiles?: (files: File[]) => void,
    onPasteUploadFields?: (files: File[]) => Promise<ResourceArguments[]>,
    onEnter?: () => void,
    searchUser?: (word: string) => Promise<UserBasic[]>
}>{
    richEl: HTMLElement;
    keydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        var key = event.key.toLowerCase();
        var isShift = event.shiftKey;
        if (!isShift && key == 'enter' && this.props.allowNewLine !== true) {
            if (typeof this.props.onEnter == 'function') { this.props.onEnter(); }
            event.preventDefault();
            return;
        }
        if (key == '@') {
            var sel = window.getSelection();
            var rect = Rect.fromEle(sel.getRangeAt(0));
            this.pop.open(rect, sel.focusNode as HTMLElement, sel.focusOffset)
        }
        else if (key = ' ') {
            var isInputLink = this.inputLink();
            if (isInputLink) return;
        }
        if (this.inputMd(key)) {
            event.preventDefault();
            return;
        }
        if (this.pop.visible == true) {
            var r = this.pop.keydown(key);
            if (r == true) {
                event.preventDefault();
                return
            }
        }
        else if (key == 'enter') {
            event.preventDefault();
            this.inputEnter()
        }
    }
    keyup = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (this.pop.visible == true) {
            this.pop.keyup()
        }
    }
    input = (event: React.FormEvent<HTMLDivElement>) => {

    }
    mousedown = (event: React.MouseEvent) => {

    }
    mouseup = (event: React.MouseEvent) => {
        var sel = window.getSelection(); //DOM
        if (sel && sel.rangeCount > 0) {
            var range = sel.getRangeAt(0); // DOM下
            if (range && this.richEl.contains(range.startContainer) && !sel.isCollapsed) {
                var rect = Rect.fromEle(range);
                var anchor = Anchor.create(this.richEl);
                if (!anchor.isCross) {
                    this.tool.open(rect, anchor.getStyle());
                    return;
                }
            }
        }
        this.tool.hide()
    }
    blur = (event: React.FocusEvent<HTMLDivElement>) => {

    }
    paste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
        var files: File[] = Array.from(event.clipboardData.files);
        var text = event.clipboardData.getData('text/plain');
        if (text) {
            event.preventDefault();
            this.insertData({ mine: 'text', data: text })
        }
        else if (files.length > 0) {
            if (typeof this.props.onPasteFiles == 'function')
                this.props.onPasteFiles(files)
            else if (typeof this.props.onPasteUploadFields == 'function') {
                var fs = await this.props.onPasteUploadFields(files);
                for (let i = 0; i < fs.length; i++) {
                    var gf = fs[i];
                    this.insertData({ mine: 'file', data: gf })
                }
            }
        }
    }
    private cursorEl: HTMLElement;
    private cursorOffset: number;
    private cursorEndEl: HTMLElement;
    private cursorEndOffset: number;
    rememberCursor() {
        var sel = window.getSelection(); //DOM
        if (sel && sel.rangeCount > 0) {
            var range = sel.getRangeAt(0); // DOM下
            if (range && this.richEl.contains(range.startContainer)) {
                this.cursorEl = range.startContainer as HTMLElement;
                this.cursorOffset = range.startOffset;
                this.cursorEndEl = range.endContainer as HTMLElement;
                this.cursorEndOffset = range.endOffset;
                return;
            }
        }
        this.cursorEl = undefined;
        this.cursorOffset = -1;
        this.cursorEndEl = undefined;
        this.cursorEndOffset = -1;
    }
    setCursor() {
        if (this.cursorEl) {
            var sel = window.getSelection(); //DOM
            sel.removeAllRanges();
            var range = document.createRange();
            if (range) {
                range.setStart(this.cursorEl, this.cursorOffset);
                if (this.cursorEndEl) range.setEnd(this.cursorEndEl, this.cursorEndOffset);
            }
            window.getSelection().addRange(range);
            delete this.cursorEl;
            delete this.cursorOffset;
            delete this.cursorEndEl;
            delete this.cursorEndOffset;
        }
        else {
            var sel = window.getSelection(); //DOM
            sel.removeAllRanges();
            var range = document.createRange();
            if (range) {
                var lp = this.getTexEl(this.richEl.childNodes[0] as HTMLElement, 'end');
                range.setStart(lp.el, lp.offset);
            }
            window.getSelection().addRange(range);
        }
    }
    render(): React.ReactNode {
        var style: CSSProperties = {};
        if (typeof this.props.height == 'number') style.minHeight = this.props.height;
        else {
            if (this.props.allowNewLine) style.minHeight = 60
            else style.minHeight = 30;
        }
        var v = this.props.value;
        if (!v) v = `<p data-type="p"></p>`
        else if (v.indexOf('</p>') < 0) {
            v = `<p data-type="p">${v}</p>`
        }
        return <div>
            <div
                style={style}
                data-placeholder={this.props.placeholder}
                spellCheck={this.props.spellCheck || false}
                contentEditable={this.props.readonly || this.props.disabled ? false : true}
                dangerouslySetInnerHTML={{ __html: v }}
                ref={e => this.richEl = e}
                onKeyDown={this.keydown}
                onInput={this.input}
                onMouseDown={this.mousedown}
                onMouseUp={this.mouseup}
                onCompositionStart={e => { }}
                onCompositionUpdate={e => { }}
                onCompositionEnd={e => { }}
                onBlur={this.blur}
                onPaste={this.paste}
            >
            </div>
            <RichTool ref={e => this.tool = e} click={this.toolClick}></RichTool>
            <RichPop ref={e => this.pop = e} searchUser={this.props.searchUser} select={this.insertUser} ></RichPop>
        </div>
    }
    tool: RichTool;
    toolClick = (command: string, data: Record<string, any>) => {
        this.setStyle(command, data)
    }
    pop: RichPop;
    componentDidMount(): void {
        document.addEventListener('mousedown', this.globalMousedown, true)
    }
    componentWillUnmount(): void {
        document.removeEventListener('mousedown', this.globalMousedown, true)
    }
    globalMousedown = (event: MouseEvent) => {
        var e = event.target as HTMLElement;
        if (!(e && this.richEl.contains(e))) {
            if (!(this.tool.el && this.tool.el.contains(e)))
                this.tool.hide();
            if (!(this.pop.el && this.pop.el.contains(e)))
                this.pop.close();
        }
    }
    insertUser(el: HTMLElement, offset: number, user: UserBasic) {
        if (el instanceof Text) {
            var content = el.textContent;
            var r = content.slice(0, offset);
            el.textContent = r;
            var sel = window.getSelection();
            sel.collapse(el, offset);
            this.insertData({ mine: 'user', data: user })
        }
    }
    inputEnter() {
        var anchor = Anchor.create(this.richEl);
        var s = anchor.split(anchor.focus);
        var np = document.createElement('p');
        np.setAttribute('data-type', 'p');
        this.richEl.insertBefore(np, anchor.focus.p.nextElementSibling || undefined);
        if (s.afters.length > 0) {
            s.afters.forEach(c => np.appendChild(c));
        }
        var sel = window.getSelection();
        sel.collapse(np, 0);
    }
    inputLink() {
        var anchor = Anchor.create(this.richEl);
        var tc = anchor.focus.text.textContent;
        var urlRegex = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\u4e00-\u9fa5\w- .\/?%&=]*)?$/;
        if (urlRegex.test(tc)) {
            var url = tc.match(urlRegex)[0];
            anchor.focus.text.textContent = tc.slice(0, tc.length - url.length);
            var link = document.createElement('a');
            link.contentEditable = 'false';
            link.innerText = url;
            if (anchor.focus.span || anchor.focus.a) anchor.focus.p.insertBefore(link, (anchor.focus.span || anchor.focus.a).nextSibling);
            else anchor.focus.text.parentNode.insertBefore(link, (anchor.focus.span || anchor.focus.a).nextSibling);
            var sel = window.getSelection();
            sel.collapse(link.childNodes[0], url.length);
            return true;
        }
        return false;
    }
    inputMd(key: string) {
        if (key == '*') {
            var anchor = Anchor.create(this.richEl);
            var tc = anchor.focus.text.textContent;
            var um = /\*[^\*]+$/;
            if (um.test(tc)) {
                var uv = tc.match(um)[0];
                var sp = document.createElement('span');
                sp.innerText = uv;
                sp.style.fontWeight = 'bold';
                if (anchor.focus.span || anchor.focus.a) anchor.focus.p.insertBefore(sp, (anchor.focus.span || anchor.focus.a).nextSibling);
                else anchor.focus.text.parentNode.insertBefore(sp, (anchor.focus.span || anchor.focus.a).nextSibling);
                var sel = window.getSelection();
                sel.collapse(sp.childNodes[0], uv.length);
                return true;
            }
        }
    }
    insertData(data: { mine: 'text' | 'user' | "file" | "icon", data: any }) {
        var anchor = Anchor.create(this.richEl);
        if (anchor.isCollapsed) anchor.deleteAnchor();
        var sel = window.getSelection();
        if (data.mine == 'text') {
            var sps = anchor.split(anchor.focus);
            var ns = data.data.split(/\n/g);
            if (ns.length > 1) {
                var node = document.createElement('span');
                node.innerText = ns[0];
                anchor.focus.p.insertBefore(node, sps.afters[0]);
                var p = anchor.focus.p;
                for (let i = 1; i < ns.length - 1; i++) {
                    var sp = document.createElement('p');
                    sp.innerHTML = `<span>${ns[i]}</span>`;
                    p.parentNode.insertBefore(sp, p.nextElementSibling);
                    p = sp;
                }
                var last = document.createElement('p');
                last.innerHTML = `<span>${ns[ns.length - 1]}</span>`;
                p.parentNode.insertBefore(last, p.nextElementSibling);
                sps.afters.forEach(af => p.appendChild(af));
                if (sps.afters.length > 0) sel.collapse(sps.afters[0], 0);
                else sel.collapse(last.childNodes[0], ns[ns.length - 1].length);
            }
            else {
                var node = document.createElement('span');
                node.innerText = data.data;
                anchor.focus.p.insertBefore(node, sps.afters[0])
                sel.collapse(node, node.childNodes[0].textContent.length)
            }
        }
        else if (data.mine == 'user') {
            var node = document.createElement('a') as HTMLElement;
            node.contentEditable = 'false';
            var user = (data.data as UserBasic);
            node.innerText = user.name;
            node.setAttribute('data-type', 'user');
            node.setAttribute('data-userid', user.id);
            var sps = anchor.split(anchor.focus);
            anchor.focus.p.insertBefore(node, sps.afters[0]);
            var sw = document.createElement('span');
            sw.innerText = ' ';
            anchor.focus.p.insertBefore(sw, sps.afters[0]);
            sel.collapse(sw, 1);
        }
        else if (data.mine == 'file') {
            var sps = anchor.split(anchor.focus);
            var dg = data as ResourceArguments;
            var np = document.createElement('p');
            np.contentEditable = 'false';
            np.setAttribute('data-type', 'file');
            var img = document.createElement('img');
            img.src = dg.url;
            np.appendChild(img);
            anchor.focus.p.parentNode.insertBefore(np, anchor.focus.p);
            var lastP = document.createElement('p');
            if (sps.afters.length > 0) {
                sps.afters.forEach(af => lastP.appendChild(af))
            }
            sel.collapse(lastP, 0);
        }
        else if (data.mine == 'icon') {
            var node = document.createElement('span');
            node.contentEditable = 'false';
            if (data.data.code) node.innerText = data.data.code;
            else node.innerHTML = `<img src='${data.data.url}'/>`;
            anchor.focus.p.insertBefore(node, anchor.focus.current);
            sel.collapse(node, 0);
        }
    }
    setStyle(command: string, data: Record<string, any>) {
        var anchor = Anchor.create(this.richEl);
        if (!anchor.isCollapsed) {
            var sel = window.getSelection();
            if (anchor.isCross) {
                var ps = anchor.middlePs();
                var start = anchor.split(anchor.start);
                start.afters = start.afters.map(af => this.setNodeStyle(af, command, data))
                ps.forEach(p => {
                    var cs = Array.from(p.childNodes);
                    cs.forEach(c => this.setNodeStyle(c as HTMLElement, command, data))
                })
                var end = anchor.split(anchor.end);
                if (end.befores.length > 0) end.befores = end.befores.map(b => this.setNodeStyle(b, command, data));
                var se = this.getTexEl(start.afters.first(), 'start');
                var ee = this.getTexEl(end.befores.last(), 'end');
                sel.setBaseAndExtent(se.el, se.offset, ee.el, ee.offset)
            }
            else {
                var g = anchor.lineBetween();
                g.middles = g.middles.map(m => this.setNodeStyle(m, command, data));
                var se = this.getTexEl(g.middles.first(), 'start');
                var ee = this.getTexEl(g.middles.last(), 'end');
                sel.setBaseAndExtent(se.el, se.offset, ee.el, ee.offset)
            }
        }
    }
    setLink(url: string) {
        var anchor = Anchor.create(this.richEl);
        if (!anchor.isCollapsed) {
            var sel = window.getSelection();
            if (!anchor.isCross) {
                var ls = anchor.lineBetween();
                var text = '';
                ls.middles.forEach(c => {
                    if (c instanceof Text) text += c.textContent;
                    else text += c.innerText;
                });
                var a = document.createElement('a');
                a.contentEditable = 'false';
                a.innerText = text;
                a.setAttribute('href', url);
                var m = ls.middles[0];
                m.parentNode.insertBefore(a, m);
                ls.middles.forEach(m => m.remove());
                sel.setBaseAndExtent(a.childNodes[0], 0, a.childNodes[0], url.length)
            }
        }
    }
    private getTexEl(el: HTMLElement, offset?: 'end' | 'start' | number) {
        if (el instanceof Text) {
            return {
                el,
                offset: offset == 'start' ? 0 : (offset == 'end' ? el.textContent.length : offset as number)
            }
        }
        else {
            var cs = Array.from(el.childNodes);
            var te = cs.find(g => g instanceof Text);
            if (el)
                return {
                    el,
                    offset: offset == 'start' ? 0 : (offset == 'end' ? te.textContent.length : offset as number)
                }
        }
        return {
            el: el,
            offset: offset == 'start' ? 0 : (typeof offset == 'number' ? offset : 0)
        }
    }
    private setNodeStyle(node: HTMLElement, command: string, data: Record<string, any>) {
        if (node instanceof Text && (node.parentNode as HTMLDivElement).tagName.toLowerCase() == 'p') {
            var sp = document.createElement('span');
            sp.innerText = node.textContent;
            node.parentNode.insertBefore(sp, node);
            node.remove();
            node = sp;
        }
        if (command == 'bold') node.style.fontWeight = 'bold';
        else if (command == 'unbold') node.style.fontWeight = 'normal';
        return node;
    }
    getText() {
        return this.richEl.innerText;
    }
    getValue() {
        return this.richEl.innerHTML;
    }
}

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
        if (anchor.isPAfter) {
            return {
                befores,
                afters,
                newText: undefined
            }
        }
        else if (anchor.text) {
            var newText: HTMLElement;
            var cs = Array.from(anchor.p.childNodes) as HTMLElement[];
            var current = anchor.current;
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
                befores = cs.findAll((c, i) => i < at);
                afters = cs.findAll((c, i) => i >= at);
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
                anchor.p.insertBefore(newText, afters[0]);
                afters.splice(0, 0, newText as any);
            }
            return {
                befores,
                afters,
                newText
            }
        }
    }
    lineBetween() {
        var befores: HTMLElement[] = [];
        var afters: HTMLElement[] = [];
        var middles: HTMLElement[] = [];
        if (this.isCollapsed) {
            var c = this.split(this.start);
            return {
                ...c,
                middles
            }
        }
        else {
            var cs = Array.from(this.start.p.childNodes) as HTMLElement[];
            var sat = cs.findIndex(g => g === this.start.current);
            var eat = cs.findIndex(g => g == this.end.current);
            befores = cs.findAll((c, i) => i < sat);
            afters = cs.findAll((c, i) => i > eat);
            middles = cs.findAll((c, i) => i > sat && i < eat);
            if (this.start.current === this.end.current) {
                if (this.start.offset == 0 && this.end.offset == this.end?.text.textContent.length) {
                    middles.push(this.start.current);
                }
                else if (this.start.offset > 0 && this.end.offset == this.end?.text.textContent.length) {
                    var tc = this.start.text.textContent;
                    this.start.text.textContent = tc.slice(0, this.start.offset);
                    befores.push(this.start.current);
                    var rest = tc.slice(this.start.offset);
                    if (this.start.a || this.start.span) {
                        var nc = (this.start.a || this.start.span).cloneNode(true) as HTMLElement;
                        nc.innerText = rest;
                        this.start.current.parentNode.insertBefore(nc, this.start.current.nextSibling);
                        middles.splice(0, 0, nc);
                    }
                    else {
                        var newT = document.createTextNode(rest);
                        this.start.target.parentNode.insertBefore(newT, this.start.target.nextSibling);
                        middles.splice(0, 0, newT as any);
                    }
                } else if (this.start.offset == 0 && this.end.offset < this.end?.text.textContent.length) {
                    var tc = this.end.text.textContent;
                    this.end.text.textContent = tc.slice(0, this.end.offset);
                    middles.push(this.end.current);
                    var rest = tc.slice(this.end.offset);
                    if (this.end.a || this.end.span) {
                        var nc = (this.end.a || this.end.span).cloneNode(true) as HTMLElement;
                        nc.innerText = rest;
                        this.end.current.parentNode.insertBefore(nc, this.end.current.nextSibling);
                        afters.splice(0, 0, nc);
                    }
                    else {
                        var newT = document.createTextNode(rest);
                        this.end.target.parentNode.insertBefore(newT, this.end.target.nextSibling);
                        afters.splice(0, 0, newT as any);
                    }
                }
                else {
                    var tc = this.start.text.textContent;
                    this.start.text.textContent = tc.slice(0, this.start.offset);
                    befores.push(this.start.current);
                    var middle = tc.slice(this.start.offset, this.end.offset);
                    var rest = tc.slice(this.end.offset);
                    if (this.start.a || this.start.span) {
                        var nc = (this.start.a || this.start.span).cloneNode(true) as HTMLElement;
                        nc.innerText = middle;
                        this.start.current.parentNode.insertBefore(nc, this.start.current.nextSibling);
                        middles.splice(0, 0, nc);

                        var rT = (this.start.a || this.start.span).cloneNode(true) as HTMLElement;
                        rT.innerText = rest;
                        this.start.current.parentNode.insertBefore(nc, nc.nextSibling);
                        afters.splice(0, 0, rT);
                    }
                    else {
                        var newT = document.createTextNode(middle);
                        this.start.target.parentNode.insertBefore(newT, this.start.target.nextSibling);
                        middles.splice(0, 0, newT as any);

                        var restT = document.createTextNode(rest);
                        this.start.target.parentNode.insertBefore(restT, newT.nextSibling);
                        afters.splice(0, 0, newT as any);
                    }
                }
            }
            else {
                if (this.start.offset == 0) {
                    middles.splice(0, 0, this.start.current)
                }
                else if (this.start.offset == this.start?.text.textContent.length) {
                    befores.push(this.start.current);
                }
                else {
                    var tc = this.start.text.textContent;
                    this.start.text.textContent = tc.slice(0, this.start.offset);
                    befores.push(this.start.current);
                    var rest = tc.slice(this.start.offset);
                    if (this.start.a || this.start.span) {
                        var nc = (this.start.a || this.start.span).cloneNode(true) as HTMLElement;
                        nc.innerText = rest;
                        this.start.current.parentNode.insertBefore(nc, this.start.current.nextSibling);
                        middles.splice(0, 0, nc);
                    }
                    else {
                        var newT = document.createTextNode(rest);
                        this.start.target.parentNode.insertBefore(newT, this.start.target.nextSibling);
                        middles.splice(0, 0, newT as any);
                    }
                }
                if (this.end.offset == 0) {
                    afters.splice(0, 0, this.end.current);
                }
                else if (this.end.offset == this.end?.text.textContent.length) {
                    middles.push(this.end.current);
                }
                else {
                    var tc = this.end.text.textContent;
                    this.end.text.textContent = tc.slice(0, this.end.offset);
                    middles.push(this.end.current);
                    var rest = tc.slice(this.end.offset);
                    if (this.end.a || this.end.span) {
                        var nc = (this.end.a || this.end.span).cloneNode(true) as HTMLElement;
                        nc.innerText = rest;
                        this.end.current.parentNode.insertBefore(nc, this.end.current.nextSibling);
                        afters.splice(0, 0, nc);
                    }
                    else {
                        var newT = document.createTextNode(rest);
                        this.end.target.parentNode.insertBefore(newT, this.end.target.nextSibling);
                        afters.splice(0, 0, newT as any);
                    }
                }
            }
            return {
                afters,
                befores,
                middles
            }
        }
    }
    delete() {
        if (this.isCross) {
            var ps = this.middlePs();
            ps.forEach(p => p.remove());
            var f = this.split(this.start);
            if (f.afters.length > 0) f.afters.forEach(a => a.remove())
            var n = this.split(this.end);
            if (n.befores.length > 0) n.befores.forEach(a => a.remove());
            return {
                node: n.afters[0] || this.end.p,
                offset: 0
            }
        }
        else {
            if (this.start.target === this.end.target) {
                var c = this.start.text.textContent;
                var g = c.slice(0, this.start.offset) + c.slice(this.end.offset);
                this.start.text.textContent = g;
                return {
                    node: this.start.text,
                    offset: this.start.offset
                }
            }
            else {
                var cs = Array.from(this.start.p.childNodes);
                var isIn: boolean = false;
                var ns: (HTMLElement | Text)[] = [];
                for (let i = 0; i < cs.length; i++) {
                    var e = cs[i];
                    var ec = !(e instanceof Text) ? e.childNodes[0] : undefined;
                    if (e === this.start.target || ec === this.start.target) {
                        isIn = true;
                    }
                    else if (e === this.end.target || ec === this.end.target) {
                        isIn = true;
                    }
                    else {
                        if (isIn) {
                            ns.push(e as HTMLElement);
                        }
                    }
                }
                var ts = this.start.text.textContent;
                this.start.text.textContent = ts.slice(0, this.start.offset);
                ns.forEach(n => n.remove())
                var es = this.end.text.textContent;
                this.end.text.textContent = es.slice(this.end.offset);
                return {
                    node: this.end.text,
                    offset: 0
                }
            }
        }
    }
    deleteAnchor() {
        var n = this.delete();
        var sel = window.getSelection();
        sel.collapse(n.node, n.offset);
        var newAnchor = Anchor.create(this.root);
        ['start', 'end', 'focus', 'isCross', 'isCollapsed'].forEach(c => this[c] = newAnchor[c])
    }
    middlePs() {
        var ps: HTMLElement[] = [];
        var ne = this.start.p.nextElementSibling as HTMLElement;
        while (true) {
            if (ne && ne != this.end.p) {
                ps.push(ne);
                ne = ne.nextElementSibling as HTMLElement;
            }
            else break;
        }
        return ps;
    }
    sps() {
        if (this.isCross) {
            var gs: HTMLElement[] = [];
            var c = this.split(this.start);
            c.afters.forEach(af => gs.push(af));
            var m = this.middlePs();
            m.forEach(c => {
                gs.push(...(Array.from(c.childNodes) as HTMLElement[]));
            })
            var e = this.split(this.end);
            e.befores.forEach(ef => gs.push(ef));
            return gs;
        }
        else return this.lineBetween().middles;
    }
    static create(root: HTMLElement) {
        var anchor = new Anchor();
        anchor.root = root;
        var sel = window.getSelection();
        anchor.isCollapsed = sel.isCollapsed;
        if (sel.isCollapsed) {
            anchor.start = this.getAnchorPos(sel.focusNode as HTMLElement, sel.focusOffset);
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
            anchor.start = this.getAnchorPos(sn as HTMLElement, so);
            anchor.end = this.getAnchorPos(en as HTMLElement, eo);
            if (isChange) anchor.focus = anchor.start;
            else anchor.focus = anchor.end;
            if (anchor.start.p !== anchor.end.p) anchor.isCross = true;
        }
        return anchor;
    }
    private static getAnchorPos(el: HTMLElement | Text, offset: number) {
        /**
         * 这里面有两种情况
         * p:after[content]
         * p->text
         * p->span->text
         * p->span->solid
         * p->a->text
         * 
         */
        var pos: AnchorPos = {
            target: el as HTMLElement,
            isPAfter: (el instanceof HTMLElement) && el.tagName.toLowerCase() == 'p' ? true : false,
            p: ((el instanceof Text ? el.parentNode : el) as HTMLElement).closest('p'),
            offset,
            text: (el instanceof Text) ? el : undefined,
            span: ((el instanceof Text ? el.parentNode : el) as HTMLElement).closest('span'),
            a: ((el instanceof Text ? el.parentNode : el) as HTMLElement).closest('a'),
        } as any;
        pos.current = (pos.a || pos.span || pos.text) as HTMLElement;
        return pos;
    }
    static style(el, attr: string, pseudoElt?: string | null) {
        if (el instanceof Text) {
            return null;
        }
        try {
            return getComputedStyle(el as HTMLElement, pseudoElt)[attr];
        }
        catch (ex) {
            console.error(ex);
            console.warn('not el computed style')
            return null;
        }
    }
    getStyle() {
        var sps = this.sps();
        if (sps.length == 0) return {}
        var style: Record<string, any> = getNodeStyle(sps[0]);
        var getNodeStyle = (node: HTMLElement) => {
            var json = {} as Record<string, any>;
            json['fontWeight'] = Anchor.style(node, 'fontWeight');
            return json;
        }
        for (let i = 1; i < sps.length; i++) {
            var dj = getNodeStyle(sps[i]);
            for (let n in style) {
                if (lodash.isNull(dj[n]) || lodash.isUndefined(dj[n]) || !lodash.isEqual(dj[n], style[n])) {
                    delete style[n];
                }
            }
            if (Object.keys(style).length == 0) break;
        }
        return style;
    }
}

type AnchorPos = {
    p: HTMLElement,
    target: HTMLElement,
    current: HTMLElement,
    text: Text,
    span: HTMLElement,
    a: HTMLElement,
    isPAfter: boolean,
    offset: number
}