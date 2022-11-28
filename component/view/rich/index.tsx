
import React, { CSSProperties } from "react";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { TextEle } from "../../../src/common/text.ele";
import { Rect } from "../../../src/common/vector/point";
import { UserBasic } from "../../../types/user";
import { RichPop } from "./pop";
import { RichTool } from "./tool";
import "./style.less";

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
    onPasteFiles?: (fiels: File[]) => void,
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
        if (this.pop.visible == true) {
            var r = this.pop.keydown(key);
            if (r == true) {
                event.preventDefault();
                return
            }
        }
        else if (key == 'enter') {
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
                this.tool.open(rect);
                return;
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
                var text = this.richEl.innerText;
                range.setStart(this.richEl, text.length);
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
        return <div>
            <div
                style={style}
                data-placeholder={this.props.placeholder}
                spellCheck={this.props.spellCheck || false}
                contentEditable={this.props.readonly || this.props.disabled ? false : true}
                dangerouslySetInnerHTML={{ __html: this.props.value }}
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
    toolClick = (command: string) => {
        this.setStyle(command)
    }
    pop: RichPop;
    componentDidMount(): void {
        document.addEventListener('mousedown', this.globalMousedown, true)
    }
    componentWillUnmount(): void {
        document.removeEventListener('mousedown', this.globalMousedown, true)
    }
    globalMousedown = (event: MouseEvent) => {

    }
    inputEnter() {
        var np = document.createElement('p');
        this.richEl.appendChild(np);
        var sel = window.getSelection();
        sel.collapse(np, 0);
    }
    insertData(data: { mine: 'text' | 'user' | "file", data: any }) {
        var sel = window.getSelection();
        var range = sel.getRangeAt(0);
        var node: HTMLElement;
        if (data.mine == 'text') {
            node = document.createElement('span');
            node.innerText = data.data;
        }
        else if (data.mine == 'user') {
            node = document.createElement('span');
            node.contentEditable = 'false';
            var user = (data.data as UserBasic);
            node.innerText = user.name;
            node.setAttribute('data-type', 'user');
            node.setAttribute('data-userid', user.id)
        }
        else if (data.mine == 'file') {
            var dg = data as ResourceArguments;
            node = document.createElement('p');
            node.setAttribute('data-type', 'file');
            var img = document.createElement('img');
            img.src = dg.url;
            node.appendChild(img);
        }
        if (range) range.insertNode(node)
        range.deleteContents()
        sel.collapse(node, node.childNodes[0].textContent.length)
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
    setStyle(command: string) {
        var sel = window.getSelection();
        var sn = sel.anchorNode;
        var so = sel.anchorOffset;
        var en = sel.focusNode;
        var eo = sel.focusOffset;
        if (sn === en && so > eo) {
            [sn, en] = [en, sn];
            [so, eo] = [eo, so];
        }
        else if (TextEle.isBefore(sn, en)) {
            [sn, en] = [en, sn];
            [so, eo] = [eo, so];
        }

    }
}