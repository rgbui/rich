import React from "react";
import { useOpenEmoji } from "../../../extensions/emoji";
import { TextEle } from "../../../src/common/text.ele";
import { Rect } from "../../../src/common/vector/point";
import { util } from "../../../util/util";
import { OpenMultipleFileDialoug } from "../../file";
import { CloseTickSvg, EmojiSvg, PlusSvg } from "../../svgs";
import { Icon } from "../icon";
import { useSelectMenuItem } from "../menu";
import "./style.less";
import { InsertSelectionText } from "./util";

export class RichTextInput extends React.Component<{
    escape_chars?: string[],
    allowUploadFile?: boolean,
    placeholder?: string,
    content?: string,
    disabled?: boolean,
    readonly?: boolean,
    popOpen: (cs: { char: string, span: HTMLElement }) => void,
    popInput?: (key: "ArrowDown" | 'ArrowUp' | 'Enter' | 'Input', charSpan?: { char: string, span: HTMLElement }) => void,
    popClose?: () => void,
    onInput: (data: { files?: File[], content?: string, reply?: { replyId: string } }) => void
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
        this.props.onInput({ content: text, reply: this.reply || undefined });
        this.richEl.innerHTML = '';
        var sel = window.getSelection();
        sel.collapse(this.richEl, 0);
        this.clearReply();
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
        if (!this.isComposition) {
            //说明是正常的输入，如果输入一些特定的md语法，那么将触发一些操作
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
    mouseup(event: React.MouseEvent) {
        this.openTool();
    }
    async openAddFile(event: React.MouseEvent) {
        var re = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, [{ name: 'addFile', text: '上传附件' }]);
        if (re) {
            if (re.item.name == 'addFile') {
                var files = await OpenMultipleFileDialoug();
                var size = 1024 * 1024 * 1024;
                var rs = files.filter(g => g.size > size);
                if (rs.length > 0) {
                    this.openEror(`${rs.map(r => r.name + `(${util.byteToString(r.size)})`).join(",")}文件大于1G,暂不支持上传`)
                }
                files = files.filter(g => g.size <= size);
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
    componentDidMount(): void {
        if (this.props.content) {
            this.richEl.innerHTML = this.props.content
        }
    }
    richEl: HTMLElement;
    el: HTMLElement;
    toolEl: HTMLElement;
    render(): React.ReactNode {
        return <div className="shy-rich-input" ref={e => this.el = e}>
            {this.reply && <div className="shy-rich-input-reply">
                <span className="shy-rich-input-reply-content">{this.reply.text}</span>
                <span className="shy-rich-input-reply-operators" onMouseDown={e => this.clearReply()}><a><Icon size={12} icon={CloseTickSvg}></Icon></a></span>
            </div>}
            {this.errorTip && <div className="shy-rich-input-error">
                <span className="shy-rich-input-error-content">{this.errorTip}</span>
                <span className="shy-rich-input-error-operators" onMouseDown={e => this.clearError()}><a><Icon size={12} icon={CloseTickSvg}></Icon></a></span>
            </div>}
            {!(this.props.allowUploadFile == false) && <Icon mousedown={e => this.openAddFile(e)} size={18} icon={PlusSvg}></Icon>}
            <div className="shy-rich-input-editor"
                ref={e => this.richEl = e}
                onKeyDown={e => { this.keydown(e.nativeEvent) }}
                onInput={e => { this.input(e.nativeEvent) }}
                onMouseDown={e => this.mousedown(e)}
                onMouseUp={e => this.mouseup(e)}
                onCompositionStart={e => { }}
                onCompositionUpdate={e => { }}
                onCompositionEnd={e => { }}
                onBlur={e => this.blur(e)}
                contentEditable={true}
                onPaste={e => this.paste(e.nativeEvent)}>
            </div>
            <Icon size={18} mousedown={e => this.openEmoji(e)} icon={EmojiSvg}></Icon>
            <div ref={e => this.toolEl = e} className="shy-rich-input-tool">
                <a onMouseDown={e => this.onToolStyle({ fontWeight: 'bold' })}><Icon icon='bold:sy'></Icon></a>
                <a onMouseDown={e => this.onToolStyle({ fontStyle: 'italic' })}><Icon icon='italic:sy'></Icon></a>
                <a onMouseDown={e => this.onToolStyle({ textDecoration: 'underline' })}><Icon icon='underline:sy'></Icon></a>
                <a onMouseDown={e => this.onToolStyle({ textDecoration: 'delete-line' })}><Icon icon='delete-line:sy'></Icon></a>
                <a><Icon icon='link:sy'></Icon><Icon icon='arrow-down:sy'></Icon></a>
            </div>
        </div>
    }
    isComposition: boolean = false;
    onCompositionStart() {
        this.isComposition = true;
    }
    onCompositionUpdate() {
        this.isComposition = true;
    }
    onCompositionEnd() {
        this.isComposition = false;
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
    onReplaceInsert(text: string) {
        this.richEl.innerHTML = text;
        var sel = window.getSelection();
        if (this.richEl.childNodes.length > 0) sel.collapse(this.richEl.childNodes[0], text.length);
        else sel.collapse(this.richEl, text.length)
    }
    private cursorEl: HTMLElement;
    private cursorOffset: number;
    private cursorEndEl: HTMLElement;
    private cursorEndOffset: number;
    rememberCursor() {
        var sel = window.getSelection(); //DOM
        if (sel && sel.rangeCount > 0) {
            var range = sel.getRangeAt(0); // DOM下
            if (range && this.el.contains(range.startContainer)) {
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
    errorTip: string = '';
    clearError() {
        if (this.errorTime) { clearTimeout(this.errorTime); this.errorTime = null; }
        this.errorTip = '';
        this.rememberCursor();
        this.forceUpdate(() => {
            this.setCursor()
        })
    }
    errorTime
    openEror(error: string) {
        this.errorTip = error;
        this.rememberCursor();
        this.forceUpdate(() => {
            this.setCursor()
        })
        if (this.errorTime) { clearTimeout(this.errorTime); this.errorTime = null; }
        this.errorTime = setTimeout(() => {
            if (this.errorTime) { clearTimeout(this.errorTime); this.errorTime = null; }
            this.clearError();
        }, 10e3);
    }
    reply: { text: string, replyId: string }
    openReply(reply: { text: string, replyId: string }) {
        this.reply = reply;
        this.rememberCursor();
        this.forceUpdate(() => {
            this.setCursor()
        })
    }
    clearReply() {
        if (this.reply) {
            this.reply = null;
            this.rememberCursor();
            this.forceUpdate(() => {
                this.setCursor()
            })
        }
    }
    openTool() {
        var sel = window.getSelection();
        if (this.richEl.contains(sel.focusNode) && this.richEl.contains(sel.anchorNode)) {
            var range = sel.getRangeAt(0);
            var rect = Rect.fromEle(range);
            var eRect = Rect.fromEle(this.el);
            this.toolEl.style.visibility = 'visible';
            this.toolEl.style.top = (rect.top - eRect.top) + 'px';
            this.toolEl.style.left = (rect.left - eRect.left) + 'px';
        }
    }
    closeTool() {
        this.toolEl.style.visibility = 'hidden';
    }
    onToolStyle(style: Record<string, any>) {
        var sel = window.getSelection();
        var startNode = sel.anchorNode;
        var startOffset = sel.anchorOffset;
        var endNode = sel.focusNode;
        var endOffset = sel.focusOffset;
        var isExchange = false;
        if (startNode === endNode && startOffset > endOffset) isExchange = true;
        else isExchange = TextEle.isBefore(endNode, startNode)
        if (isExchange) {
            [endNode, startNode] = [startNode, endNode];
            [endOffset, startOffset] = [startOffset, endOffset];
        }
        var cs = Array.from(this.richEl.childNodes);
        var isIn: boolean;
        var texts: Text[] = [];
        for (let i = 0; i < cs.length; i++) {
            if (isIn === false) break;
            var ts = cs[i];
            if (ts === startNode) { isIn = true; }
            if (ts instanceof Text) {
                texts.push(ts);
            }
            else {
                var subs = Array.from(ts.childNodes);
                for (var g = 0; g < subs.length; g++) {
                    if (isIn === false) break;
                    var sg = subs[g] as Text;
                    if (sg === startNode) isIn = true;
                    texts.push(sg);
                    if (ts == sg) isIn = false;
                }
            }
            if (ts === endNode) isIn = false;
        }
        // if (startNode === endNode) {
        //     if (startNode.parentNode === this.richEl) {
        //         if (startNode instanceof Text) {
        //             var data = startNode.textContent;
        //             var t1 = document.createElement('span');
        //             t1.innerText = data.slice(0, startOffset);
        //             var t2 = document.createElement('span');
        //             t2.innerText = data.slice(startOffset, endOffset);
        //             Object.keys(style).forEach(s => { t2.style[s] = style[s]; });
        //             var t3 = document.createElement('span');
        //             t3.innerText = data.slice(endOffset);
        //             this.richEl.removeChild(startNode);
        //             this.richEl.appendChild(t1);
        //             this.richEl.appendChild(t2);
        //             this.richEl.appendChild(t3);
        //             if (t1.innerText == '') t1.remove()
        //             if (t3.innerText == '') t3.remove()
        //         }
        //         else {
        //             var data = startNode.textContent;
        //             var t2 = startNode as HTMLSpanElement;
        //             var t1 = (startNode as HTMLSpanElement).cloneNode(true) as HTMLSpanElement;
        //             t1.innerText = data.slice(0, startOffset);
        //             t1.insertBefore(startNode.parentNode, startNode);

        //             t2.innerText = data.slice(startOffset, endOffset);
        //             Object.keys(style).forEach(s => { t2.style[s] = style[s]; });

        //             var t3 = (startNode as HTMLSpanElement).cloneNode(true) as HTMLSpanElement;
        //             t3.innerText = data.slice(endOffset);
        //             var n = startNode.nextSibling;
        //             if (n) t3.insertBefore(startNode.parentNode, n)
        //             else startNode.parentNode.appendChild(t3)
        //             if (t1.innerText == '') t1.remove()
        //             if (t3.innerText == '') t3.remove()
        //         }
        //     }
        //     else {
        //         /*****<span>text</span> */
        //     }
        // }
        // var cs = Array.from(this.richEl.childNodes);
        // for (let i = 0; i < cs.length; i++) {
        //     var e = cs[i];
        //     if (e instanceof Text) {

        //     }
        //     else if (e instanceof HTMLSpanElement) {
        //         var subs = Array.from(e.childNodes);
        //     }
        // }
    }
    onOpenLink(event: React.MouseEvent) {

    }
}

