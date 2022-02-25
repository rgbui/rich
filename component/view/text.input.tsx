import React from "react";


export class RichTextInput extends React.Component<{
    escape_chars?: string[],
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

    }
    charSpan: { char: string, span: HTMLElement } = { char: '', span: null };
    keydown(event: KeyboardEvent) {
        if (!event.shiftKey && event.key == 'Enter') {
            if (this.charSpan.char) {
                this.props.popInput(event.key, { ...this.charSpan });
            } else this.send();
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
    render(): React.ReactNode {
        return <div className="shy-rich-text-input">
            <div className="shy-rich-text-input-editor"
                onKeyDown={e => { this.keydown(e.nativeEvent) }}
                onInput={e => { this.input(e.nativeEvent) }}
                onMouseDown={e => this.mousedown(e)}
                onBlur={e => this.blur(e)}
                contentEditable={true}
                onPaste={e => this.paste(e.nativeEvent)}>
            </div>
        </div>
    }
    onInsert(text: string, data?: Record<string, any>, pos?: { char: string, span: HTMLElement }) {
        var cps = typeof pos == 'undefined' ? this.charSpan : pos;
        if (cps) {
            cps.span.innerHTML = text;
            if (data)
                cps.span.setAttribute('data-link', JSON.stringify(data))
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
}

function InsertSelectionText(text: string) {
    var sel = window.getSelection(); //DOM 
    var range = sel.getRangeAt(0); // DOM下 
    if (range.startContainer) { // DOM下 
        sel.removeAllRanges(); // 删除Selection中的所有Range 
        range.deleteContents(); // 清除Range中的内容 
        // 获得Range中的第一个html结点 
        var container = range.startContainer;
        // 获得Range起点的位移 
        var pos = range.startOffset;
        // 建一个空Range 
        range = document.createRange();
        // 插入内容 
        var cons = window.document.createTextNode(text);
        if (container.nodeType == 3) {// 如是一个TextNode 
            (container as Text).insertData(pos, cons.nodeValue);
            // 改变光标位置 
            range.setEnd(container, pos + cons.nodeValue.length);
            range.setStart(container, pos + cons.nodeValue.length);
        } else {// 如果是一个HTML Node 
            var afternode = container.childNodes[pos];
            container.insertBefore(cons, afternode);
            range.setEnd(cons, cons.nodeValue.length);
            range.setStart(cons, cons.nodeValue.length);
        }
        sel.addRange(range);
    }
}