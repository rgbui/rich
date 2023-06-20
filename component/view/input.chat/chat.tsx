import React, { CSSProperties } from "react";
import { InputChatTool } from "./plugins/tool";
import "./style.less";
import { InsertSelectionText } from "./util";
import { ChatInputPop } from "./plugins/pop";
import { RobotInfo, RobotTask, UserBasic } from "../../../types/user";
import { Rect } from "../../../src/common/vector/point";
import { ChatCommandInput } from "./plugins/command";
import { util } from "../../../util/util";
import { getTextLink } from "../../../src/kit/write/declare";
import { InputChatBox } from "./box";

export type ChatInputOptions = {

    placeholder?: string;
    disabled?: boolean,
    readonly?: boolean,
    height?: number,
    value?: string,
    onInput?: (value: string) => void,
    allowNewLine?: boolean,
    spellCheck?: boolean,
    onPasteFiles?: (files: File[]) => void,
    onEnter?: (value: string) => void,
    searchUser?: (word: string) => Promise<UserBasic[]>,
    searchRobots?: () => Promise<RobotInfo[]>,
    style?: CSSProperties,
    disabledInputQuote?: boolean,
    box?: InputChatBox
}

export class ChatInput extends React.Component<ChatInputOptions>{
    isQuote: boolean = false;
    keydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        var key = event.key.toLowerCase();
        var isShift = event.shiftKey;
        if (this.currentCommand) {
            //回车提交
            //左右移动
            //回退移动或回退删除command
            if (!isShift && key == 'enter') {
                if (typeof this.props.onEnter == 'function') {
                    this.props.onEnter(this.getValue());
                }
                event.preventDefault();
                return;
            }
            else if (key == 'arrowleft' || key == 'arrowright') {
                var sel = window.getSelection();
                var node = sel.focusNode;
                if (node instanceof Text) node = node.parentNode;
                if (node && (node as HTMLElement)?.classList?.contains('task-prop-value')) {
                    var text = (node as HTMLElement).innerText;
                    var pa = (node as HTMLElement).closest('.task-prop');
                    if (key == 'arrowleft' && sel.focusOffset == 0) {
                        if (pa.previousElementSibling && pa.previousElementSibling.classList.contains('task-prop')) {
                            var te = pa.previousElementSibling.querySelector('.task-prop-value');
                            if (te) {
                                if (te.childNodes[0]) te = te.childNodes[0] as any;
                                var n = te instanceof Text ? te.textContent.length : te.innerHTML.length;
                                if (te) {
                                    sel.setBaseAndExtent(te, n, te, n);
                                    event.preventDefault();
                                    return;
                                }
                            }
                        }
                    }
                    else if (key == 'arrowright' && sel.focusOffset == text.length) {
                        if (pa.nextElementSibling && pa.nextElementSibling.classList.contains('task-prop')) {
                            var te = pa.nextElementSibling.querySelector('.task-prop-value');
                            if (te instanceof HTMLElement) {
                                if (te.childNodes[0]) te = te.childNodes[0] as any;
                                if (te) {
                                    sel.setBaseAndExtent(te, 0, te, 0)
                                    event.preventDefault();
                                    return;
                                }
                            }
                        }
                    }
                }
            }
            else if (key == 'backspace' || key == 'delete') {
                var sel = window.getSelection();
                var node = sel.focusNode;
                if (node instanceof Text) node = node.parentNode;
                if (node && (node as HTMLElement)?.classList?.contains('task-prop-value')) {
                    var text = (node as HTMLElement).innerText;
                    var pa = (node as HTMLElement).closest('.task-prop');
                    if (sel.focusOffset == 0) {
                        if (pa.previousElementSibling && pa.previousElementSibling.classList.contains('task-prop')) {
                            var te = pa.previousElementSibling.querySelector('.task-prop-value');
                            if (te) {
                                if (te.childNodes[0]) te = te.childNodes[0] as any;
                                var n = te instanceof Text ? te.textContent.length : te.innerHTML.length;
                                if (te) {
                                    sel.setBaseAndExtent(te, n, te, n);
                                    event.preventDefault();
                                    return;
                                }
                            }
                        }
                        else if (!pa.previousElementSibling || pa.previousElementSibling && !pa.previousElementSibling.classList?.contains('task-prop')) {
                            this.cancelCommand()
                        }
                    }
                }
            }
        }
        if (this.userPop.visible == true) {
            if (key == 'enter' || key == 'arrowdown' || key == 'arrowup') {
                this.userPop.keydown(key);
                event.preventDefault();
                return;
            }
            if (key == 'backspace' || key == 'delete') {
                this.userPop.back();
                return;
            }
            if (key == ' ' && !event.nativeEvent.isComposing || key == '@' || key == '#' || key == '/') {
                this.userPop.hide()
            }
        }
        if (this.commandInput.visible == true) {
            if (key == 'enter' || key == 'arrowdown' || key == 'arrowup') {
                this.commandInput.keydown(key);
                event.preventDefault();
                return;
            }
            if (key == 'backspace' || key == 'delete') {
                this.commandInput.back();
                return;
            }
            if (key == ' ' && !event.nativeEvent.isComposing || key == '@' || key == '#' || key == '/') {
                this.commandInput.hide()
            }
        }
        if ((!this.props.disabledInputQuote) == true && (key.charCodeAt(0) == 32 || key.charCodeAt(0) == 160) && !event.nativeEvent.isComposing) {
            var sel = window.getSelection();
            var node = sel.focusNode;
            var offset = sel.focusOffset;
            if (!node.previousSibling) {
                var t = (node as Text).textContent;
                if (t && (t.slice(0, offset) == '>' || t.slice(0, offset) == '》')) {
                    if (this.isQuote == false) {
                        (node as Text).textContent = t.slice(1);
                        event.preventDefault();
                        this.onTurnQuote()
                    }
                }
            }
        }
        if (!isShift && key == 'enter' && this.props.allowNewLine !== true) {
            var value = this.richEl.innerHTML;
            let regex = new RegExp('```', 'g');
            let count = (value.match(regex) || []).length;
            if (count % 2 == 0) {
                if (typeof this.props.onEnter == 'function') {
                    this.props.onEnter(this.getValue());
                }
                event.preventDefault();
                return;
            }
        }
        else if (key == '@') {
            if (this.userPop.visible == true) {
                this.userPop.hide();
                return;
            }
            var sel = window.getSelection();
            var node = sel.focusNode;
            if (node instanceof Text) {
                this.userPop.open();
                return;
            }
            else if (node === this.richEl && sel.focusOffset == 0) {
                this.userPop.open();
                return;
            }
        }
        else if (key == '/' && typeof this.props.searchRobots == 'function') {
            var sel = window.getSelection();
            var node = sel.focusNode;
            if (node === this.richEl && sel.focusOffset == 0) {
                this.commandInput.open();
                return;
            }
        }
        else if (key == 'backspace' || key == 'delete') {
            if (this.isQuote) {
                var sel = window.getSelection();
                var node = sel.focusNode;
                if (node === this.richEl || node instanceof Text && !node.previousSibling) {
                    if (sel.focusOffset == 0) {
                        this.onTurnQuote(false)
                        event.preventDefault()
                    }
                }
            }
        }
    }
    keyup = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.nativeEvent.isComposing) return;
        if (this.userPop.visible == true) {
            this.userPop.keyup()
        }
        if (this.commandInput.visible == true) {
            this.commandInput.keyup();
        }
    }
    input = (event: React.FormEvent<HTMLDivElement>) => {

        if (typeof this.props.onInput == 'function')
            this.props.onInput(this.getValue())
    }
    mousedown = (event: React.MouseEvent) => {

    }
    mouseup = (event: React.MouseEvent) => {
        if (this.tool.visible == true) {
            this.tool.hide()
        }
        else {
            if (this.currentCommand) return;
            var sel = window.getSelection(); //DOM
            if (sel && sel.rangeCount > 0) {
                var range = sel.getRangeAt(0); // DOM下
                if (range && this.richEl.contains(range.startContainer) && !sel.isCollapsed) {
                    var rect = Rect.fromEle(range);
                    this.tool.open(rect);
                    event.preventDefault()
                    return;
                }
            }
            this.tool.hide()
        }
    }
    globalMousedown = (event: MouseEvent) => {
        if (this.userPop.visible) {
            if (this.userPop.el && this.userPop.el.contains(event.target as HTMLElement)) return;
            this.userPop.hide();
        }
        if (this.tool.visible) {
            if (this.tool.el && this.tool.el.contains(event.target as HTMLElement)) return;
            this.tool.hide()
        }
        if (this.commandInput.visible == true) {
            if (this.commandInput.el && this.commandInput.el.contains(event.target as HTMLElement)) return;
            this.commandInput.hide()
        }
    }
    blur = (event: React.FocusEvent<HTMLDivElement>) => {

    }
    paste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
        var files: File[] = Array.from(event.clipboardData.files);
        var text = event.clipboardData.getData('text/plain');
        if (text) {
            event.preventDefault();
            InsertSelectionText(text)
        }
        else if (files.length > 0) {
            if (typeof this.props.onPasteFiles == 'function')
                this.props.onPasteFiles(files)
        }
    }
    getValue() {
        var html = this.richEl.innerHTML;
        html = getTextLink(html);
        html = html.replace(/(\*\*[^\*]+\*\*)/g, (_, $1) => {
            return '<b>' + $1.slice(2, -2) + '</b>'
        })
        html = html.replace(/(\*[^\*]+\*)/g, (_, $1) => {
            return '<i>' + $1.slice(1, -1) + '</i>'
        })
        html = html.replace(/(\~\~[^\~]+\~\~)/g, (_, $1) => {
            return '<del>' + $1.slice(2, -2) + '</del>'
        })
        // console.log('before', html);
        html = html.replace(/(\`\`\`[^\`]+\`\`\`)/g, (_, $1) => {
            var pc = $1.trim().slice(3, -3);
            pc = pc.replace(/^(\<br\/?\>)+/g, '');
            pc = pc.replace(/(\<br\/?\>)+$/g, '');
            return '<pre><code>' + pc + '</code></pre>'
        })
        // console.log('after', html);
        html = html.replace(/(\`[^\`]+\`)/g, (_, $1) => {
            return '<code>' + $1.slice(1, -1) + '</code>'
        })
        if (this.isQuote) {
            html = '<blockquote>' + html + '</blockquote>'
        }
        return html;
    }
    getMentionUsers() {
        var users = Array.from(this.richEl.querySelectorAll('a.at-user')) as HTMLElement[];
        return users.map(u => {
            return u.getAttribute('data-userid');
        })
    }
    richEl: HTMLElement;
    render(): React.ReactNode {
        var style: CSSProperties = { outline: 'none', width: '100%' };
        if (typeof this.props.height == 'number') style.minHeight = this.props.height;
        else {
            if (this.props.allowNewLine) style.minHeight = 60
            else style.minHeight = 30;
        }
        if (typeof this.props.style !== 'undefined') Object.assign(style, this.props.style)
        var v = this.props.value;
        return <div>
            <div className={"text shy-rich-view" + (this.isQuote ? " shy-rich-view-quote" : "")}
                style={style}
                data-placeholder={this.props.placeholder}
                spellCheck={this.props.spellCheck || false}
                contentEditable={this.currentCommand || this.props.readonly || this.props.disabled ? false : true}
                dangerouslySetInnerHTML={{ __html: v }}
                ref={e => this.richEl = e}
                onKeyDown={this.keydown}
                onKeyUp={this.keyup}
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
            <ChatInputPop cp={this} search={this.props.searchUser} select={this.selectUser} ref={e => this.userPop = e} ></ChatInputPop>
            <InputChatTool ref={e => this.tool = e} click={this.toolClick}></InputChatTool>
            <ChatCommandInput
                searchRobots={this.props.searchRobots}
                select={(e, r) => this.selectCommand(e, r)}
                cp={this}
                ref={e => this.commandInput = e}></ChatCommandInput>
        </div>
    }
    userPop: ChatInputPop;
    selectUser = (user: UserBasic) => {
        var sel = window.getSelection();
        var node = sel.focusNode as Node;
        var offset = sel.focusOffset;
        if (node instanceof Text) {
            var content = node.textContent;
            var bt = content.slice(0, offset);
            var at = content.slice(offset);
            node.textContent = bt.slice(0, bt.lastIndexOf('@'))
            var a = document.createElement('a');
            a.innerText = "@" + user.name;
            a.classList.add('at-user');
            a.setAttribute('data-userid', user.id);
            a.contentEditable = 'false';
            if (node.nextSibling) a.insertBefore(node.parentNode, node.nextSibling)
            else node.parentNode.appendChild(a)
            if (at) {
                var t = document.createTextNode(at)
                if (a.nextSibling) t.insertBefore(a.parentNode, a.nextSibling)
                else a.parentNode.appendChild(t)
            }
            if (a.nextSibling) sel.collapse(a.nextSibling)
            else {
                var span = document.createElement('span');
                if (a.nextSibling) span.insertBefore(a.parentNode, a.nextSibling)
                else a.parentNode.appendChild(span)
                sel.collapse(span, 0);
            }
        }
    }
    tool: InputChatTool;
    toolClick = (type: string) => {
        var sel = window.getSelection();
        var text = sel.focusNode as Text;
        var content = text.textContent;
        var s: number, e: number;
        if (sel.focusOffset > sel.anchorOffset) {
            s = sel.anchorOffset;
            e = sel.focusOffset;
        }
        else {
            s = sel.focusOffset;
            e = sel.anchorOffset;
        }
        var d = 1;
        if (type == 'bold') {
            d = 2;
            text.textContent = content.slice(0, s) + "**" + content.slice(s, e) + "**" + content.slice(e);
        }
        else if (type == 'italic') {
            text.textContent = content.slice(0, s) + "*" + content.slice(s, e) + "*" + content.slice(e);
        }
        else if (type == 'code') {
            text.textContent = content.slice(0, s) + "`" + content.slice(s, e) + "`" + content.slice(e);
        }
        else if (type == 'delete') {
            d = 2;
            text.textContent = content.slice(0, s) + "~~" + content.slice(s, e) + "~~" + content.slice(e);
        }
        else if (type == 'quote') {
            this.onTurnQuote(this.isQuote ? false : true);
            return;
        }
        var r = sel.getRangeAt(0);
        sel.setBaseAndExtent(text, s + d, text, e + d);
        // sel.removeAllRanges();

    }
    componentDidMount(): void {
        document.addEventListener('mousedown', this.globalMousedown, true);
    }
    componentWillUnmount(): void {
        document.removeEventListener('mousedown', this.globalMousedown, true)
    }
    onTurnQuote(quote?: boolean) {
        if (typeof quote == 'undefined') this.isQuote = true;
        else this.isQuote = quote;
        this.forceUpdate()
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
    commandInput: ChatCommandInput;
    currentCommand: RobotTask;
    currentRobot: RobotInfo
    selectCommand(e: RobotTask, robot: RobotInfo) {
        this.currentCommand = e;
        this.currentRobot = robot;
        var args: string[] = [];
        e.args.forEach(arg => {
            args.push(`
            <span class='task-prop'>
                <span data-task-prop='${arg.name}'>${arg.text || arg.name}</span>
                <span class='task-prop-value' contentEditable='true'></span>
            </span>
        `)
        })
        this.richEl.innerHTML = `<span>/${e.name}</span><span>${args.join('')}</span>`;
        if (this.props.box) this.props.box.forceUpdate(() => {
            var sel = window.getSelection();
            var e = this.richEl.querySelector('.task-prop-value');
            if (e) {
                sel.setBaseAndExtent(e, 0, e, 0);
            }
        })
        else this.forceUpdate(() => {
            var sel = window.getSelection();
            var e = this.richEl.querySelector('.task-prop-value');
            if (e) {
                sel.setBaseAndExtent(e, 0, e, 0);
            }
        });
    }
    cancelCommand() {
        this.currentCommand = null;
        this.currentRobot = null;
        if (this.props.box) this.props.box.forceUpdate(async () => {
            var sel = window.getSelection();
            await util.delay(100);
            sel.collapse(this.richEl, 0);
            this.richEl.innerHTML = '';
        })
        else this.forceUpdate(async () => {
            var sel = window.getSelection();
            await util.delay(100);
            sel.collapse(this.richEl, 0);
            this.richEl.innerHTML = '';
        })
    }
    getCommandValue() {
        if (!this.currentCommand) return {}
        var args: Record<string, any> = {}
        var props = Array.from(this.richEl.querySelectorAll('[data-task-prop]'));
        props.forEach(prop => {
            var name = prop.getAttribute('data-task-prop');
            var value = prop.nextElementSibling as HTMLElement;
            args[name] = value.innerText;
        })
        return {
            robot: this.currentRobot,
            task: this.currentCommand,
            args
        }
    }
    onEnter() {
        if (typeof this.props.onEnter == 'function') {
            this.props.onEnter(this.getValue());
        }
    }
    async onCommandInput() {
        this.richEl.innerHTML = '/';
        await util.delay(100);
        var sel = window.getSelection();
        var text = this.richEl.childNodes[0];
        sel.setBaseAndExtent(text, 1, text, 1);
        this.commandInput.open();
    }
}