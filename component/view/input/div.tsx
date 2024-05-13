
import React from "react"
import { CSSProperties } from "react"

export class DivInput extends React.Component<{
    placeholder?: string,
    onInput?: (value: string) => void,
    onChange?: (value: string) => void,
    onEnter?: (value) => void,
    onKeyDown?: (event: React.KeyboardEvent) => void,
    onMouseDown?: (event: React.MouseEvent) => void,
    value?: string,
    style?: CSSProperties,
    ignoreFilterWhitespace?: boolean,
    className?: string | string[],
    line?: boolean,
    rf?: (e: HTMLElement) => void
}> {
    el: HTMLElement;
    render() {
        var props = this.props;
        var self = this;
        // const [el, setEl] = useState<HTMLElement>(null)
        function input(e?: React.FormEvent<HTMLDivElement>) {
            var text = self.el.innerText;
            if (props.ignoreFilterWhitespace !== true) {
                text = text.trim();
            }
            if (typeof props.onInput == 'function') {
                var sel = window.getSelection()
                props.onInput(text);
            }
        }
        function change() {
            var text = self.el.innerText;
            if (props.ignoreFilterWhitespace !== true) {
                text = text.trim();
            }
            if (typeof props.onChange == 'function') {
                var sel = window.getSelection()
                props.onChange(text);
            }
        }
        function paster(e: React.ClipboardEvent<HTMLSpanElement>) {
            e.preventDefault();
            var text = e.clipboardData.getData('text/plain');
            var sel = window.getSelection();
            var f = sel.focusNode;
            if (f instanceof Text && self.el.contains(f)) {
                var d = f.textContent;
                var pos = sel.focusOffset;
                var newContent = d.slice(0, pos) + text + d.slice(pos);
                f.textContent = newContent;
                sel.collapse(f, pos + text.length)
                input()
            }
            else {
                self.el.innerText = text;
                if (text.length > 0) {
                    var c = self.el.childNodes[self.el.childNodes.length - 1];
                    if (c instanceof Text) {
                        sel.collapse(c, c.textContent.length)
                    }
                    else sel.collapse(self.el, self.el.childNodes.length)
                }
                input()
            }
        }
        async function keydown(event: React.KeyboardEvent) {
            if (event.key == 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();
                var text = self.el.innerText;
                if (props.ignoreFilterWhitespace !== true) {
                    text = text.trim();
                }
                if (typeof props.onEnter == 'function')
                    props.onEnter(text);
            }
            if (typeof props.onKeyDown == 'function') props.onKeyDown(event)
        }
        async function mousedown(event: React.MouseEvent) {
            if (typeof props.onMouseDown == 'function') props.onMouseDown(event)
        }
        var classList: string[] = ["shy-div-input"];
        if (Array.isArray(props.className)) classList.push(...props.className)
        else if (props.className) classList.push(props.className)

        var style: CSSProperties = props.style || {};
        if (props.line !== true) return <div
            className={classList.join(" ")}
            style={style}
            ref={e => { self.el = e; props.rf ? props.rf(e) : undefined; }}
            onPaste={e => paster(e)}
            onInput={e => input(e)}
            onChange={e => change()}
            onBlur={e => change()}
            onKeyDown={e => keydown(e)}
            onMouseDown={e => mousedown(e)}
            contentEditable={true}
            data-placeholder={props.placeholder}
            dangerouslySetInnerHTML={{ __html: props.value }}
        ></div>
        return <span
            className={classList.join(" ")}
            style={style}
            ref={e => { self.el = e; props.rf ? props.rf(e) : undefined; }}
            onPaste={e => paster(e)}
            onInput={e => input()}
            onChange={e => change()}
            onBlur={e => change()}
            onKeyDown={e => keydown(e)}
            onMouseDown={e => mousedown(e)}
            contentEditable={true}
            data-placeholder={props.placeholder}
            dangerouslySetInnerHTML={{ __html: props.value }}
        ></span>
    }
    shouldComponentUpdate(nextProps: Readonly<{ placeholder?: string; onInput?: (value: string) => void; onChange?: (value: string) => void; onEnter?: (value) => void; onKeyDown?: (event: React.KeyboardEvent) => void; onMouseDown?: (event: React.MouseEvent) => void; value?: string; style?: CSSProperties; ignoreFilterWhitespace?: boolean; className?: string | string[]; line?: boolean; rf?: (e: HTMLElement) => void; }>, nextState: Readonly<{}>, nextContext: any): boolean {
        var self = this; var text = self.el?.innerText;
        if (this.props.ignoreFilterWhitespace !== true) {
            text = text?.trim();
        }
        if (nextProps.value != text) return true;
        return false;
        // return nextProps.value != this.props.value;
    }
}


// export function DivInput(props: {
//     placeholder?: string,
//     onInput?: (value: string) => void,
//     onChange?: (value: string) => void,
//     onEnter?: (value) => void,
//     onKeyDown?: (event: React.KeyboardEvent) => void,
//     onMouseDown?: (event: React.MouseEvent) => void,
//     value?: string,
//     style?: CSSProperties,
//     ignoreFilterWhitespace?: boolean,
//     className?: string | string[],
//     line?: boolean,
//     rf?: (e: HTMLElement) => void
// }) {
//     const [el, setEl] = useState<HTMLElement>(null)
//     function input(e?: React.FormEvent<HTMLDivElement>) {
//         var text = el.innerText;
//         if (props.ignoreFilterWhitespace !== true) {
//             text = text.trim();
//         }
//         if (typeof props.onInput == 'function') {
//             var sel = window.getSelection()
//             props.onInput(text);
//         }
//     }
//     function change() {
//         var text = el.innerText;
//         if (props.ignoreFilterWhitespace !== true) {
//             text = text.trim();
//         }
//         if (typeof props.onChange == 'function') {
//             var sel = window.getSelection()
//             props.onChange(text);
//         }
//     }
//     function paster(e: React.ClipboardEvent<HTMLSpanElement>) {
//         e.preventDefault();
//         var text = e.clipboardData.getData('text/plain');
//         var sel = window.getSelection();
//         var f = sel.focusNode;
//         if (f instanceof Text && el.contains(f)) {
//             var d = f.textContent;
//             var pos = sel.focusOffset;
//             var newContent = d.slice(0, pos) + text + d.slice(pos);
//             f.textContent = newContent;
//             sel.collapse(f, pos + text.length)
//             input()
//         }
//         else {
//             el.innerText = text;
//             if (text.length > 0) {
//                 var c = el.childNodes[el.childNodes.length - 1];
//                 if (c instanceof Text) {
//                     sel.collapse(c, c.textContent.length)
//                 }
//                 else sel.collapse(el, el.childNodes.length)
//             }
//             input()
//         }
//     }
//     async function keydown(event: React.KeyboardEvent) {
//         if (event.key == 'Enter' && !event.shiftKey) {
//             event.preventDefault();
//             event.stopPropagation();
//             var text = el.innerText;
//             if (props.ignoreFilterWhitespace !== true) {
//                 text = text.trim();
//             }
//             if (typeof props.onEnter == 'function')
//                 props.onEnter(text);
//         }
//         if (typeof props.onKeyDown == 'function') props.onKeyDown(event)
//     }
//     async function mousedown(event: React.MouseEvent) {
//         if (typeof props.onMouseDown == 'function') props.onMouseDown(event)
//     }
//     var classList: string[] = ["shy-div-input"];
//     if (Array.isArray(props.className)) classList.push(...props.className)
//     else if (props.className) classList.push(props.className)

//     var style: CSSProperties = props.style || {};
//     if (props.line !== true) return <div
//         className={classList.join(" ")}
//         style={style}
//         ref={e => { setEl(e); props.rf ? props.rf(e) : undefined; }}
//         onPaste={e => paster(e)}
//         onInput={e => input(e)}
//         onChange={e => change()}
//         onBlur={e => change()}
//         onKeyDown={e => keydown(e)}
//         onMouseDown={e => mousedown(e)}
//         contentEditable={true}
//         data-placeholder={props.placeholder}
//         dangerouslySetInnerHTML={{ __html: props.value }}
//     ></div>
//     return <span
//         className={classList.join(" ")}
//         style={style}
//         ref={e => { setEl(e); props.rf ? props.rf(e) : undefined; }}
//         onPaste={e => paster(e)}
//         onInput={e => input()}
//         onChange={e => change()}
//         onBlur={e => change()}
//         onKeyDown={e => keydown(e)}
//         onMouseDown={e => mousedown(e)}
//         contentEditable={true}
//         data-placeholder={props.placeholder}
//         dangerouslySetInnerHTML={{ __html: props.value }}
//     ></span>
// }