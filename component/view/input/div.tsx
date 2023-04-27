import { observer, useLocalObservable } from "mobx-react"
import React from "react"
import { CSSProperties } from "react"
export var DivInput = observer(function (props: {
    placeholder?: string,
    onInput?: (value: string) => void,
    onChange?: (value: string) => void,
    onEnter?: (value) => void,
    onMouseDown?: (event: React.MouseEvent) => void,
    value?: string,
    style?: CSSProperties,
    ignoreFilterWhitespace?: boolean,
    className?: string | string[],
    line?: boolean,
    rf?: (e: HTMLElement) => void
}) {
    var local = useLocalObservable<{ el: HTMLElement }>(() => {
        return {
            el: null
        }
    })
    function input() {
        var text = local.el.innerText;
        if (props.ignoreFilterWhitespace !== true) {
            text = text.trim();
        }
        if (typeof props.onInput == 'function')
            props.onInput(text);
    }
    function change() {
        var text = local.el.innerText;
        if (props.ignoreFilterWhitespace !== true) {
            text = text.trim();
        }
        if (typeof props.onChange == 'function')
            props.onChange(text);
    }
    function paster(e: React.ClipboardEvent<HTMLSpanElement>) {
        e.preventDefault();
        var text = e.clipboardData.getData('text/plain');
        var sel = window.getSelection();
        var f = sel.focusNode;
        if (f instanceof Text && local.el.contains(f)) {
            var d = f.textContent;
            var newContent = d.slice(0, sel.focusOffset) + text + d.slice(sel.focusOffset);
            f.textContent = newContent;
            input()
        }
    }

    async function keydown(event: React.KeyboardEvent) {
        if (event.key == 'Enter' && !event.shiftKey) {
            event.preventDefault();
            var text = local.el.innerText;
            if (props.ignoreFilterWhitespace !== true) {
                text = text.trim();
            }
            if (typeof props.onEnter == 'function')
                props.onEnter(text);
        }
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
        ref={e => { local.el = e; props.rf ? props.rf(e) : undefined; }}
        onPaste={e => paster(e)}
        onInput={e => input()}
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
        ref={e => { local.el = e; props.rf ? props.rf(e) : undefined; }}
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
})