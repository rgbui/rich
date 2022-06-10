import React from "react";
import { useOpenEmoji } from "../../../extensions/emoji";
import { Rect } from "../../../src/common/vector/point";
import { OpenMultipleFileDialoug } from "../../file";
import { EmojiSvg, PlusSvg } from "../../svgs";
import { Icon } from "../icon";
import { useSelectMenuItem } from "../menu";
import "./style.less";
import { InsertSelectionText } from "./util";
export class RichTextInput extends React.Component<{
    escape_chars?: string[],
    allowUploadFile?: boolean,
    placeholder?: string,
    disabled?: boolean,
    readonly?: boolean,
    popOpen: (cs: { char: string, span: HTMLElement }) => void,
    popInput?: (key: "ArrowDown" | 'ArrowUp' | 'Enter' | 'Input', charSpan?: { char: string, span: HTMLElement }) => void,
    popClose?: () => void,
    onInput: (data: { files?: File[], content?: string }) => void
}>{
    paste(event: ClipboardEvent) {
        var files: File[] = Array.from(event.clipboardData.files);
        var text = event.clipboardData.getData('text/plain');
        if (text) {
            event.preventDefault();
            InsertSelectionText(text);
        }
        else if (files.length > 0) {
            this.props.onInput({ files })
        }
    }
    send() {
        var text = this.richEl.innerHTML;
        this.props.onInput({ content: text });
        this.richEl.innerHTML = '';
        var sel = window.getSelection();
        sel.collapse(this.richEl, 0);
    }
    charSpan: { char: string, span: HTMLElement } = { char: '', span: null };
    keydown(event: KeyboardEvent) {
        if (!event.shiftKey && event.key == 'Enter') {
            if (this.charSpan.char) {
                this.props.popInput(event.key, { ...this.charSpan });
            } else { event.preventDefault(); this.send(); }
        }
        else {
            var key = event.key;
            var chars = this.props.escape_chars ? this.props.escape_chars : ['@'];
            if (chars.includes(key)) {
                this.charSpan.char = key;
                event.preventDefault();
                var sel = window.getSelection();
                var node = sel.focusNode;
                var offset = sel.focusOffset;
                var preText, nextText;
                var isNode;
                if (node instanceof Text) {
                    //node为text节点
                    preText = node.textContent.slice(0, offset);
                    nextText = node.textContent.slice(offset);
                }
                else if (node instanceof HTMLElement) {
                    preText = node.innerText.slice(0, offset);
                    nextText = node.innerText.slice(offset);
                    isNode = true;
                    node.innerText = '';
                }
                if (preText) {
                    var preNode = document.createTextNode(preText);
                    if (isNode) node.appendChild(preNode)
                    else node.parentNode.insertBefore(preNode, node)
                }
                var atSpan = document.createElement('span');
                atSpan.innerText = this.charSpan.char;
                this.charSpan.span = atSpan;
                if (isNode) node.appendChild(atSpan);
                else node.parentNode.insertBefore(atSpan, node)
                if (nextText) {
                    var preNode = document.createTextNode(nextText);
                    if (isNode) node.appendChild(preNode)
                    else node.parentNode.insertBefore(preNode, node)
                }
                if (!isNode) (node as any).remove();
                sel.collapse(atSpan, 1);
                if (this.props.popOpen) this.props.popOpen({ ...this.charSpan });
            }
            else if (['ArrowDown', 'ArrowUp'].includes(key) && this.charSpan.char) {
                if (typeof this.props.popInput == 'function') {
                    this.props.popInput(key as any, { ...this.charSpan });
                }
            }
        }
    }
    input(ev: Event) {
        if (this.charSpan.char) {
            if (typeof this.props.popInput == 'function') {
                this.props.popInput('Input', { ...this.charSpan });
            }
        }
    }
    blur(event: React.FocusEvent) {
        if (this.charSpan.char) {
            this.charSpan = { char: '', span: null };
            if (typeof this.props.popClose == 'function') this.props.popClose()
        }
    }
    mousedown(event: React.MouseEvent) {
        if (this.charSpan.char) {
            this.charSpan = { char: '', span: null };
            if (typeof this.props.popClose == 'function') this.props.popClose()
        }
    }
    async openAddFile(event: React.MouseEvent) {
        var re = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, [{ name: 'addFile', text: '上传附件' }]);
        if (re) {
            if (re.item.name == 'addFile') {
                var files = await OpenMultipleFileDialoug();
                if (files.length > 0) {
                    this.props.onInput({ files });
                }
            }
        }
    }
    async openEmoji(event: React.MouseEvent) {
        this.rememberCursor();
        var re = await useOpenEmoji({
            roundArea: Rect.fromEvent(event),
            direction: 'top',
            align: 'end'
        });
        setTimeout(() => {
            this.setCursor();
            if (re) {
                InsertSelectionText(re.code);
            }
        }, 100);
    }
    richEl: HTMLElement;
    el: HTMLElement;
    render(): React.ReactNode {
        return <div className="shy-rich-input" ref={e => this.el = e}>
            <Icon mousedown={e => this.openAddFile(e)} size={18} icon={PlusSvg}></Icon>
            <div className="shy-rich-input-editor"
                ref={e => this.richEl = e}
                onKeyDown={e => { this.keydown(e.nativeEvent) }}
                onInput={e => { this.input(e.nativeEvent) }}
                onMouseDown={e => this.mousedown(e)}
                onBlur={e => this.blur(e)}
                contentEditable={true}
                onPaste={e => this.paste(e.nativeEvent)}>
            </div>
            <Icon size={18} mousedown={e => this.openEmoji(e)} icon={EmojiSvg}></Icon>
        </div>
    }
    onInsert(text: string, data?: Record<string, any>, pos?: { char: string, span: HTMLElement }) {
        var cps = typeof pos == 'undefined' ? this.charSpan : pos;
        if (cps) {
            cps.span.innerHTML = text;
            if (data) cps.span.setAttribute('data-link', JSON.stringify(data))
            var sel = window.getSelection();
            sel.collapse(cps.span, text.length);
        }
        else {
            console.warn('not found insert pos rich text input');
        }
        if (this.charSpan.char) {
            this.charSpan = { char: '', span: null };
            if (typeof this.props.popClose == 'function') this.props.popClose()
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
            if (this.el.contains(range.startContainer)) {
                this.cursorEl = range.startContainer as HTMLElement;
                this.cursorOffset = range.startOffset;
                this.cursorEndEl = range.endContainer as HTMLElement;
                this.cursorEndOffset = range.endOffset;
            }
        }
    }
    setCursor() {
        if (this.cursorEl) {
            var sel = window.getSelection(); //DOM
            sel.removeAllRanges();
            var range = document.createRange();
            if (range) {
                range.setStart(this.cursorEl, this.cursorOffset);
                if (this.cursorEndEl)
                    range.setEnd(this.cursorEndEl, this.cursorEndOffset);
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
}

