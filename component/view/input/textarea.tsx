import React, { CSSProperties } from "react";
import "./style.less";


export class Textarea extends React.Component<{
    style?: CSSProperties,
    disabled?: boolean,
    value?: string,
    placeholder?: string,
    onChange?: (value: string) => void,
    onEnter?: (value) => void,
    shiftEnter?: boolean,
    ctrlEnter?: boolean,
    metaEnter?: boolean,
    clear?: boolean,
    maxLength?: number,
    ignoreFilterWhitespace?: boolean,
    round?: boolean,
    transparent?: boolean,
    autoHeight?: boolean,
}>{
    updateValue(value) {
        this.inputEl.value = value;
    }
    inputEl: HTMLTextAreaElement;
    render(): React.ReactNode {
        var props = this.props;
        function filterValue(value: string) {
            if (props.ignoreFilterWhitespace == true) return value;
            return value.trim()
        }
        function keydown(e: React.KeyboardEvent) {
            if (e.key == 'Enter' && props.onEnter) {
                if (e.shiftKey && props.shiftEnter) {
                    props.onEnter(filterValue((e.target as HTMLInputElement).value));
                }
                else if (e.ctrlKey && props.ctrlEnter) {
                    props.onEnter(filterValue((e.target as HTMLInputElement).value));
                }
                else if (e.metaKey && props.metaEnter) {
                    props.onEnter(filterValue((e.target as HTMLInputElement).value));
                }
            }
        }
        var style = Object.assign({}, props.style || {});
        if (props.autoHeight) { style.height = 'auto'; style.minHeight = 80 }
        return <div className='shy-textarea' style={style}>
            <textarea
                ref={e => this.inputEl = e}
                maxLength={props.maxLength || undefined}
                defaultValue={props.value || ''}
                disabled={props.disabled ? true : false}
                placeholder={props.placeholder}
                style={{
                    borderRadius: props.round === false ? 0 : undefined,
                    boxShadow: props.transparent ? 'none' : undefined,
                    backgroundColor: props.transparent ? 'transparent' : undefined,
                    height: props.autoHeight ? 'auto' : undefined,
                    resize: props.autoHeight ? 'vertical' : undefined,
                    minHeight: props.autoHeight ? 80 : undefined
                }}
                onInput={e => props.onChange && props.onChange(filterValue((e.target as HTMLInputElement).value))}
                onKeyDown={e => keydown(e)}></textarea>
        </div>
    }
}



