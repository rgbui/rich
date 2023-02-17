import React, { CSSProperties } from "react";
import "./style.less";


export class Textarea extends React.Component<{
    style?: CSSProperties,
    disabled?: boolean,
    value?: string,
    placeholder?: string,
    onChange?: (value: string) => void,
    onEnter?: (value) => void,
    clear?: boolean,
    maxLength?: number,
    ignoreFilterWhitespace?: boolean
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
                //  props.onEnter(filterValue((e.target as HTMLInputElement).value));
            }
        }
        return <div className='shy-textarea' style={props.style || {}}>
            <textarea ref={e => this.inputEl = e} maxLength={props.maxLength || undefined} defaultValue={props.value || ''}
                disabled={props.disabled ? true : false}
                placeholder={props.placeholder} onInput={e => props.onChange && props.onChange(filterValue((e.target as HTMLInputElement).value))}
                onKeyDown={e => keydown(e)}></textarea>
        </div>
    }
}



