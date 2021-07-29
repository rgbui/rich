import React, { CSSProperties } from "react";
export function Input(props: { style?: CSSProperties, disabled?: boolean, value?: string, placeholder?: string, onChange?: (value: string) => void, onEnter?: (value) => void }) {
    function keydown(e: React.KeyboardEvent) {
        if (e.key == 'Enter' && props.onEnter) {
            props.onEnter((e.target as HTMLInputElement).value);
        }
    }
    return <div className='sy-input' style={props.style || {}}>
        <input type='text' defaultValue={props.value || ''}
            disabled={props.disabled ? true : false}
            placeholder={props.placeholder}
            onInput={e => props.onChange && props.onChange((e.target as HTMLInputElement).value)}
            onKeyDown={e => keydown(e)}
        ></input>
    </div>
}