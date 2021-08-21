import React, { CSSProperties } from "react";
export function Input(props: {
    style?: CSSProperties,
    disabled?: boolean,
    value?: string,
    placeholder?: string,
    onChange?: (value: string) => void,
    onEnter?: (value) => void,
    clear?: boolean,
    maxLength?: number,
    ignoreFilterWhitespace?: boolean
}
) {
    function filterValue(value: string) {
        if (props.ignoreFilterWhitespace == true) return value;
        return value.trim()
    }
    function keydown(e: React.KeyboardEvent) {
        if (e.key == 'Enter' && props.onEnter) {
            props.onEnter(filterValue((e.target as HTMLInputElement).value));
        }
    }
    return <div className='shy-input' style={props.style || {}}>
        <input type='text' defaultValue={props.value || ''}
            disabled={props.disabled ? true : false}
            placeholder={props.placeholder}
            onInput={e => props.onChange && props.onChange(filterValue((e.target as HTMLInputElement).value))}
            onKeyDown={e => keydown(e)}
            maxLength={props.maxLength || undefined}
        ></input>
    </div>
}

export function Textarea(props: {
    style?: CSSProperties,
    disabled?: boolean,
    value?: string,
    placeholder?: string,
    onChange?: (value: string) => void,
    onEnter?: (value) => void,
    clear?: boolean,
    maxLength?: number,
    ignoreFilterWhitespace?: boolean
}) {
    function filterValue(value: string) {
        if (props.ignoreFilterWhitespace == true) return value;
        return value.trim()
    }
    function keydown(e: React.KeyboardEvent) {
        if (e.key == 'Enter' && props.onEnter) {
            props.onEnter(filterValue((e.target as HTMLInputElement).value));
        }
    }
    return <div className='shy-textarea' style={props.style || {}}>
        <textarea maxLength={props.maxLength || undefined} defaultValue={props.value || ''}
            disabled={props.disabled ? true : false}
            placeholder={props.placeholder} onInput={e => props.onChange && props.onChange(filterValue((e.target as HTMLInputElement).value))}
            onKeyDown={e => keydown(e)}></textarea>
    </div>
}