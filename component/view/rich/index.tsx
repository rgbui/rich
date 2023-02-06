
import React, { CSSProperties } from "react";
import { RichPop } from "./pop";
import { RichTool } from "./tool";
import "./style.less";
import { Anchor } from "./anchor";
import lodash from "lodash";
import { Rect } from "../../../src/common/vector/point";
import { PopoverPosition } from "../../../extensions/popover/position";
import { PopoverSingleton } from "../../../extensions/popover/popover";

export type RichOptions = {
    placeholder?: string,
    disabled?: boolean,
    readonly?: boolean,
    value?: string,
    onInput?: (value: string) => void,
    allowNewLine?: boolean,
    height?: number,
    spellCheck?: boolean,
    onPasteFiles?: (files: File[]) => void,
    onPasteUploadFields?: (files: File[]) => Promise<Record<string, any>[]>,
    onEnter?: () => void,
    searchUser?: (word: string) => Promise<Record<string, any>[]>,
    allowUser?: boolean
}

/**
 * 
 * rich format:
 * text
 * <p><span></span></p>
 *  
 */
export class RichView extends React.Component<RichOptions>{
    richEl: HTMLElement;
    keydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        var key = event.key.toLowerCase();
        var isShift = event.shiftKey;
        if (!isShift && key == 'enter' && this.props.allowNewLine !== true) {
            if (typeof this.props.onEnter == 'function') { this.props.onEnter(); }
            event.preventDefault();
            this.inputEnter();
            return;
        }
        if (key == '@' && !(this.props.allowUser === false)) {
            var sel = window.getSelection();
            var rect = Rect.fromEle(sel.getRangeAt(0));
            this.pop.open(rect, sel.focusNode as HTMLElement, sel.focusOffset)
        }
        else if (key == ' ') {
            var isInputLink = this.inputLink();
            if (isInputLink) {
                this.inputEnter();
                return;
            }
        }
        else if (key == 'backspace' || key == 'delete') {
            if (this.backspace()) {
                event.preventDefault();
                this.inputEnter();
                return;
            }
        }
        if (this.inputMd(key)) {
            event.preventDefault();
            this.inputEnter();
            return;
        }
        if (this.pop.visible == true) {
            var r = this.pop.keydown(key);
            if (r == true) {
                event.preventDefault();
                this.onInput();
                return
            }
        }
        else if (key == 'enter') {
            event.preventDefault();
            this.inputEnter();
            this.onInput();
        }
    }
    keyup = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (this.pop.visible == true) {
            this.pop.keyup()
        }
    }
    input = (event: React.FormEvent<HTMLDivElement>) => {
        this.onInput();
    }
    mousedown = (event: React.MouseEvent) => {

    }
    mouseup = (event: React.MouseEvent) => {
        // var sel = window.getSelection(); //DOM
        // if (sel && sel.rangeCount > 0) {
        //     var range = sel.getRangeAt(0); // DOM下
        //     if (range && this.richEl.contains(range.startContainer) && !sel.isCollapsed) {
        //         var rect = Rect.fromEle(range);
        //         var anchor = Anchor.create(this.richEl);
        //         if (!anchor.isCross) {
        //             this.tool.open(rect, anchor.getStyle());
        //             return;
        //         }
        //     }
        // }
        // this.tool.hide()
    }
    blur = (event: React.FocusEvent<HTMLDivElement>) => {

    }
    paste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
        var files: File[] = Array.from(event.clipboardData.files);
        var text = event.clipboardData.getData('text/plain');
        if (text) {
            event.preventDefault();
            this.insertData({ mine: 'text', data: text })
            this.onInput();
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
        var style: CSSProperties = { outline: 'none', width: '100%' };
        if (typeof this.props.height == 'number') style.minHeight = this.props.height;
        else {
            if (this.props.allowNewLine) style.minHeight = 60
            else style.minHeight = 30;
        }
        var v = this.props.value;
        return <div>
            <div className="shy-rich-view"
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
    insertUser(el: HTMLElement, offset: number, user: Record<string, any>) {
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
        if (anchor.focus.isBlockRoot) {
            var ond = document.createElement('p');
            this.richEl.appendChild(ond);
            s.befores.forEach(c => ond.appendChild(c))
        }
        var np = document.createElement('p');
        this.richEl.insertBefore(np, anchor.focus.isBlockRoot ? null : anchor.focus.block.nextElementSibling);
        if (s.afters.length > 0) {
            s.afters.forEach(c => np.appendChild(c));
        }
        this.collapse(np, 0)
    }
    inputLink() {
        var anchor = Anchor.create(this.richEl);
        var ft = anchor.focus.text
        var textContent = ft.textContent;
        var tc = textContent.slice(0, anchor.focus.offset);
        var rest = textContent.slice(anchor.focus.offset);
        rest = ' ' + rest;
        var urlRegex = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\u4e00-\u9fa5\w- .\/?%&=]*)?$/;
        if (urlRegex.test(tc)) {
            var url = tc.match(urlRegex)[0];
            var befores = tc.slice(0, tc.length - url.length);
            anchor.focus.text.textContent = tc.slice(0, tc.length - url.length);
            var link = document.createElement('a');
            link.contentEditable = 'false';
            link.setAttribute('href', url);
            link.setAttribute('target', "_blank");
            link.innerText = url;

            if (anchor.focus.lineBlock) anchor.focus.block.insertBefore(link, anchor.focus.lineBlock.nextSibling);
            else anchor.focus.text.parentNode.insertBefore(link, anchor.focus.text.nextSibling);
            if (rest) {
                if (anchor.focus.lineBlock) {
                    var lb = anchor.focus.lineBlock.cloneNode(true) as HTMLElement;
                    lb.innerText = rest;
                    link.parentNode.insertBefore(lb, link.nextSibling);
                }
                else {
                    var sss = document.createElement('span');
                    sss.innerText = rest;
                    link.parentNode.insertBefore(sss, link.nextSibling);
                }
            }
            if (befores) ft.textContent = befores;
            else ft.remove();
            this.collapse(link.nextSibling as any, 'start');
            return true;
        }
        return false;
    }
    inputMd(key: string) {
        if (key == '*') {
            var anchor = Anchor.create(this.richEl);
            var ft = anchor.focus.text
            var textContent = ft.textContent;
            var tc = textContent.slice(0, anchor.focus.offset);
            var rest = textContent.slice(anchor.focus.offset);
            var um = /\*[^\*]+$/;
            if (um.test(tc)) {
                var uv = tc.match(um)[0];
                var befores = tc.slice(0, tc.length - uv.length);
                var sp = document.createElement('span');
                uv = uv.slice(1);
                sp.innerText = uv;
                sp.style.fontWeight = 'bold';

                if (anchor.focus.lineBlock) anchor.focus.block.insertBefore(sp, anchor.focus.lineBlock.nextSibling);
                else anchor.focus.text.parentNode.insertBefore(sp, anchor.focus.text.nextSibling);
                if (rest) {
                    if (anchor.focus.lineBlock) {
                        var lb = anchor.focus.lineBlock.cloneNode(true) as HTMLElement;
                        lb.innerText = rest;
                        sp.parentNode.insertBefore(lb, sp.nextSibling);
                    }
                    else {
                        var sss = document.createElement('span');
                        sss.innerText = rest;
                        sp.parentNode.insertBefore(sss, sp.nextSibling);
                    }
                }
                if (befores) ft.textContent = befores;
                else ft.remove();


                var sel = window.getSelection();
                sel.collapse(sp.childNodes[0], uv.length);
                return true;
            }
        }
    }
    backspace() {
        var anchor = Anchor.create(this.richEl);
        if (anchor.isCollapsed) {
            if (anchor.focus.offset == 0) {
                if (anchor.focus.lineBlock && anchor.focus.lineBlock.innerText == '') {
                    var pre = anchor.focus.lineBlock.previousSibling;
                    if (pre) {
                        if (pre instanceof Text) {
                            pre.textContent = pre.textContent.slice(0, pre.textContent.length - 1);
                            this.collapse(pre as any, 'end');
                            return true;
                        }
                        else {
                            (pre as HTMLElement).innerText = (pre as HTMLElement).innerText.slice(0, (pre as HTMLElement).innerText.length - 1);
                            this.collapse(pre as any, 'end');
                            return true;
                        }
                    }
                    else {
                        if (anchor.focus.isBlockRoot) {
                            return true;
                        }
                        else {
                            var preBlock = anchor.focus.block.previousElementSibling as HTMLElement;
                            if (preBlock) {
                                var last = Array.from(preBlock.childNodes);
                                var g = Array.from(anchor.focus.block.childNodes);
                                g.forEach(c => preBlock.appendChild(c));
                                anchor.focus.block.remove();
                                if (last) this.collapse(last as any, 'end')
                                else this.collapse(preBlock, 'start');
                            }
                            else return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    deleteSectionAndFocus() {
        var anchor = Anchor.create(this.richEl);
        if (!anchor.isCollapsed) {
            var sps = anchor.sps();
            var s = sps[0];
            var pre = Anchor.findPre(s);
            var next;
            if (!pre) {
                var e = sps[sps.length - 1];
                next = Anchor.findNext(s)
            }
            sps.forEach(sp => {
                var p = sp.parentNode as HTMLElement;
                if (sp instanceof Text && p.tagName && (['a', 'span'].includes(p.tagName))) p.remove()
                else sp.remove()
            })
            if (pre) this.collapse(pre as any, 'end')
            else if (next) this.collapse(next as any, 'start')
        }
    }
    collapse(el: HTMLElement, offset: 'start' | 'end' | number) {
        var sel = window.getSelection();
        if (el instanceof Text) {
            sel.collapse(el, offset == 'start' ? 0 : (offset == 'end' ? el.textContent.length : offset))
        }
        else if (typeof offset == 'number' || offset == 'start') {
            var c = el.childNodes[0];
            if (c) sel.collapse(c, offset == 'start' ? 0 : offset);
            else sel.collapse(el, offset == 'start' ? 0 : offset)
        }
        else {
            var c = el.childNodes[el.childNodes.length - 1];
            if (c) {
                if (c instanceof Text) sel.collapse(c, c.textContent.length)
                else sel.collapse(c, c.childNodes.length)
            }
            else sel.collapse(el, el.childNodes.length);
        }
    }
    setBaseAndExtent(startEl: HTMLElement, startOffset: 'start' | 'end' | number, endEl: HTMLElement, endOffset: number | 'start' | 'end') {
        var sel = window.getSelection();
        var sText: Text;
        if (startEl instanceof Text) sText = startEl;
        else {
            var c = startEl.childNodes[0];
            if (c instanceof Text) sText = c;
            else sText = startEl as any;
        }
        var soffset: number;
        if (typeof startOffset != 'number') {
            if (startOffset == 'start') soffset = 0
            else soffset = sText instanceof Text ? sText.textContent.length : startEl.innerText.length;
        }
        else soffset = startOffset;
        var eText: Text;
        if (endEl instanceof Text) eText = endEl;
        else {
            var c = endEl.childNodes[0];
            if (c instanceof Text) eText = c;
            else eText = endEl as any;
        }
        var eoffset: number;
        if (typeof endOffset != 'number') {
            if (endOffset == 'start') eoffset = 0
            else eoffset = eText instanceof Text ? eText.textContent.length : endEl.innerText.length;
        } else eoffset = endOffset;
        sel.setBaseAndExtent(sText, soffset, eText, eoffset);
    }
    insertData(data: { mine: 'text' | 'user' | "file" | "icon", data: any }) {
        var anchor = Anchor.create(this.richEl);
        if (data.mine == 'text') {
            var sps = anchor.split(anchor.focus);
            var ns = data.data.split(/\r?\n/g);
            lodash.remove(ns, g => g ? false : true);
            if (ns.length > 1) {
                var node = document.createElement('span');
                node.innerText = ns[0];
                if (anchor.focus.isBlockRoot) anchor.focus.block.insertBefore(node, sps.afters[0])
                else anchor.focus.lineBlock.parentNode.insertBefore(node, sps.afters[0])
                if (anchor.focus.isBlockRoot) {
                    var rp = document.createElement('p');
                    var cs = Array.from(anchor.focus.block.childNodes);
                    cs.forEach(c => rp.appendChild(c));
                    anchor.focus.block.appendChild(rp)
                }
                var p = anchor.focus.isBlockRoot ? anchor.focus.block.querySelector('p') : anchor.focus.block;
                for (let i = 1; i < ns.length - 1; i++) {
                    var sp = document.createElement('p');
                    sp.innerHTML = `<span>${ns[i]}</span>`;
                    p.parentNode.insertBefore(sp, p.nextElementSibling);
                    p = sp;
                }
                var last = document.createElement('p');
                last.innerHTML = `<span>${ns[ns.length - 1]}</span>`;
                p.parentNode.insertBefore(last, p.nextElementSibling);
                sps.afters.forEach(af => last.appendChild(af));
                if (sps.afters.length > 0) this.collapse(sps.afters[0], 'start');
                else this.collapse(last.childNodes[0] as HTMLElement, 'end');
            }
            else {
                var node = document.createElement('span');
                node.innerText = data.data;
                if (anchor.focus.isBlockRoot) anchor.focus.block.insertBefore(node, sps.afters[0])
                else anchor.focus.lineBlock.parentNode.insertBefore(node, sps.afters[0])
                this.collapse(node, 'end')
            }
        }
    }
    setStyle(command: string, data: Record<string, any>) {
        var anchor = Anchor.create(this.richEl);
        var list = anchor.sps();
        list.forEach((pl, i) => {
            var c = this.setNodeStyle(pl, command, data)
            if (c) list[i] = pl;
        })
        if (list.length > 0) this.setBaseAndExtent(list[0], 'start', list[list.length - 1], 'end');
    }
    setLink(url: string) {
        var anchor = Anchor.create(this.richEl);
        if (!anchor.isCollapsed) {
            if (!anchor.isCross) {
                var sps = anchor.sps();
                var text = '';
                sps.forEach(s => {
                    if (s instanceof Text) text += s.textContent;
                    else text += s.innerText;
                });
                this.deleteSectionAndFocus();
                anchor = Anchor.create(this.richEl);
                var a = document.createElement('a');
                a.contentEditable = 'false';
                a.innerText = text;
                a.setAttribute('href', url);
                if (anchor.focus.lineBlock) {
                    anchor.focus.lineBlock.parentNode.insertBefore(a, anchor.focus.lineBlock);
                }
                else {
                    anchor.focus.text.parentNode.insertBefore(a, anchor.focus.text)
                }
                this.setBaseAndExtent(a, 'start', a, 'end');
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
        if (node instanceof Text && (node.parentNode == this.richEl || (node.parentNode as HTMLDivElement).tagName.toLowerCase() == 'p')) {
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
    onInput() {
        if (typeof this.props.onInput == 'function')
            this.props.onInput(this.getValue())
    }
}


export class RichViewBox extends React.Component {
    options: RichOptions
    open(options: RichOptions) {
        this.options = options;
        this.forceUpdate();
    }
    render(): React.ReactNode {
        if (!this.options) return <></>
        return this.options && <div className="padding-14 round w-400 h-300 overflow-y"><RichView height={300} {...this.options}></RichView></div>
    }
}


export async function useRichView(props: RichOptions) {
    var pos: PopoverPosition = { center: true, centerTop: 100 };
    let popover = await PopoverSingleton(RichViewBox, { mask: true, shadow: true });
    let fv = await popover.open(pos);
    fv.open(props);
    return new Promise((resolve: (count: number) => void, reject) => {
        popover.only('close', () => {
            resolve(null);
        });
    })
}