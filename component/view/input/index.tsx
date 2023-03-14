import React, { CSSProperties } from "react";
import { CloseSvg } from "../../svgs";
import { Icon } from "../icon";
import "./style.less";

export class Input extends React.Component<{
    style?: CSSProperties,
    disabled?: boolean,
    value?: string,
    type?: 'text' | 'password' | 'number',
    placeholder?: string,
    readonly?: boolean,
    onChange?: (value: string, e?: React.FormEvent<HTMLInputElement>) => void,
    onEnter?: (value: string, e?: React.KeyboardEvent) => void,
    onClear?: () => void,
    onKeydown?: (event: React.KeyboardEvent) => void,
    clear?: boolean,
    maxLength?: number,
    ignoreFilterWhitespace?: boolean,
    name?: string,
    size?: 'small' | 'default' | 'larger',
    className?: string | (string[]),
    onMousedown?: (event: React.MouseEvent) => void
}>{
    private inputEl: HTMLInputElement;
    onClear() {
        var self = this;
        var props = this.props;
        self.inputEl.value = '';
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
                if (!value) self.forceUpdate()
            }
        }
        function keydown(e: React.KeyboardEvent) {
            if (e.key == 'Enter' && props.onEnter) {
                props.onEnter(filterValue((e.target as HTMLInputElement).value), e);
            }
            else if (props.onKeydown) props.onKeydown(e);
        }
        var classList: string[] = ['shy-input'];
        if (this.props.size == 'small') classList.push('small')
        else if (this.props.size == 'larger') classList.push('larger')
        if (Array.isArray(this.props.className)) this.props.className.each(c => { classList.push(c) })
        else if (this.props.className) classList.push(this.props.className)

        return <div onMouseDown={e => { props.onMousedown && props.onMousedown(e) }} className={classList.join(" ")} style={props.style || {}}>
            <div className="shy-input-wrapper">
                <input ref={e => this.inputEl = e} type={props.type || 'text'} defaultValue={props.value || ''}
                    disabled={props.disabled ? true : false}
                    placeholder={props.placeholder}
                    onInput={e => onInput(e)}
                    onKeyDown={e => keydown(e)}
                    readOnly={props.readonly}
                    maxLength={props.maxLength || undefined}
                    name={props.name}
                ></input>
            </div>
            {props.clear && this.props.value && <div className="shy-input-clear" onClick={e => this.onClear()}>
                <div className="size-20 flex-center item-hover circle cursor "><Icon size={10} icon={CloseSvg}></Icon></div>
            </div>}
        </div>
    }
    updateValue(value) {
        this.inputEl.value = value;
    }
}


