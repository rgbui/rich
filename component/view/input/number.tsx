import React, { CSSProperties } from "react";
import { ArrowDownSvg, ArrowUpSvg } from "../../svgs";
import { Icon } from "../icon";

export class InputNumber extends React.Component<{
    style?: CSSProperties,
    disabled?: boolean,
    value?: number,
    placeholder?: string,
    readonly?: boolean,
    onChange?: (value: number, e?: React.FormEvent<HTMLInputElement>) => void,
    onEnter?: (value: number, e?: React.KeyboardEvent) => void,
    name?: string,
    size?: 'small' | 'default', className?: string | (string[]),
}>{
    private inputEl: HTMLInputElement;
    render() {
        var self = this;
        function filterValue(value: string) {
            var r = parseFloat(value.trim());
            if (isNaN(r)) return undefined;
            else return r;
        }

        function onInput(e: React.FormEvent<HTMLInputElement>) {
            var v = filterValue((e.target as HTMLInputElement).value);
            if (typeof v == 'number')
                props.onChange(v, e);
        }

        function onDeep(increase: number) {
            var v = filterValue(self.inputEl.value || '0');
            if (typeof v == 'number') {
                props.onChange(v + increase);
                self.inputEl.value = (v + increase).toString();
            }

        }

        function keydown(e: React.KeyboardEvent<HTMLInputElement>) {
            if (e.key == 'Enter' && props.onEnter) {
                var v = filterValue((e.target as HTMLInputElement).value);
                if (typeof v == 'number')
                    props.onEnter(v, e);
            }
        }
        var props = this.props;
        var classList: string[] = ['shy-input'];
        if (Array.isArray(this.props.className)) this.props.className.each(c => { classList.push(c) })
        else if (this.props.className) classList.push(this.props.className)
        return <div className={classList.join(" ")} style={props.style || {}}>
            <div className="shy-input-wrapper">
                <input ref={e => this.inputEl = e} type={'text'} defaultValue={props.value || ''}
                    disabled={props.disabled ? true : false}
                    placeholder={props.placeholder}
                    onInput={e => onInput(e)}
                    onKeyDown={e => keydown(e)}
                    readOnly={props.readonly}
                    name={props.name}
                ></input>
                <div className="pos pos-center-right">
                    <span onMouseDown={e => onDeep(-1)}><Icon size={12} icon={ArrowDownSvg}></Icon></span>
                    <span onMouseDown={e => onDeep(1)}><Icon size={12} icon={ArrowUpSvg}></Icon></span>
                </div>
            </div>
        </div>
    }
}