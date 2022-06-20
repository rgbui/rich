import React, { CSSProperties } from "react";
import { CloseTickSvg } from "../svgs";
import { Icon } from "./icon";

export class Input extends React.Component<{
    style?: CSSProperties,
    disabled?: boolean,
    value?: string,
    type?: 'text' | 'password',
    placeholder?: string,
    readonly?: boolean,
    onChange?: (value: string, e?: React.FormEvent<HTMLInputElement>) => void,
    onEnter?: (value: string, e?: React.KeyboardEvent) => void,
    onClear?: () => void,
    clear?: boolean,
    maxLength?: number,
    ignoreFilterWhitespace?: boolean,
    name?: string,
    size?: 'small' | 'default'
}>{
    private clearVisible: boolean = false;
    private inputEl: HTMLInputElement;
    onClear() {
        var self = this;
        var props = this.props;
        self.inputEl.value = '';
        self.clearVisible = false;
        self.forceUpdate()
        props.onChange && props.onChange('');
        props.onClear && props.onClear()
    }
    render() {
        var props = this.props;
        var self = this;
        function filterValue(value: string) {
            if (props.ignoreFilterWhitespace == true) return value;
            return value.trim()
        }
        function onInput(e: React.FormEvent<HTMLInputElement>) {
            var value = filterValue((e.target as HTMLInputElement).value)
            props.onChange && props.onChange(value, e);
            if (props.clear) {
                var visible = value ? true : false;
                if (visible != self.clearVisible) {
                    self.clearVisible = visible;
                    self.forceUpdate()
                }
            }
        }
        function keydown(e: React.KeyboardEvent) {
            if (e.key == 'Enter' && props.onEnter) {
                props.onEnter(filterValue((e.target as HTMLInputElement).value), e);
            }
        }
        return <div className={'shy-input' + (props.size == 'small' ? " small" : "")} style={props.style || {}}>
            <input ref={e => this.inputEl = e} type={props.type || 'text'} defaultValue={props.value || ''}
                disabled={props.disabled ? true : false}
                placeholder={props.placeholder}
                onInput={e => onInput(e)}
                onKeyDown={e => keydown(e)}
                readOnly={props.readonly}
                maxLength={props.maxLength || undefined}
                name={props.name}
            ></input>
            {props.clear && this.clearVisible && <div className="shy-input-clear" onClick={e => this.onClear()}><Icon size={10} icon={CloseTickSvg}></Icon></div>}
        </div>
    }
    updateValue(value) {
        this.inputEl.value = value;
    }
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

