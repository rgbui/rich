import React, { CSSProperties } from "react";
import { DownSvg, UpSvg } from "../../svgs";
import { Icon } from "../icon";
import lodash from "lodash";

export class InputNumber extends React.Component<{
    style?: CSSProperties,
    disabled?: boolean,
    value?: number,
    placeholder?: string,
    readonly?: boolean,
    onChange?: (value: number, e?: React.FormEvent<HTMLInputElement>) => void,
    onEnter?: (value: number, e?: React.KeyboardEvent) => void,
    name?: string,
    size?: 'small' | 'default' | 'larger', className?: string | (string[]),
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
            else if (lodash.isUndefined(v))
                props.onChange(null, e);
        }
        function onDeep(increase: number) {
            var v = filterValue(self.inputEl.value || '0');
            if (typeof v == 'number') {
                props.onChange(v + increase);
                self.inputEl.value = (v + increase).toString();
            }
            else if (lodash.isUndefined(v)) { props.onChange(null); }
        }
        function keydown(e: React.KeyboardEvent<HTMLInputElement>) {
            if (e.key == 'Enter' && props.onEnter) {
                var v = filterValue((e.target as HTMLInputElement).value);
                if (typeof v == 'number') props.onEnter(v, e);
                else if (lodash.isUndefined(v)) { props.onChange(null); }
            }
        }
        var props = this.props;
        var classList: string[] = ['shy-input', 'relative', 'visible-hover'];
        if (Array.isArray(this.props.className)) this.props.className.each(c => { classList.push(c) })
        else if (this.props.className) classList.push(this.props.className)
        if (props.size == 'small') classList.push('small');
        else if (props.size == 'larger') classList.push('larger');

        return <div className={classList.join(" ")} style={props.style || {}}>
            <div className="shy-input-wrapper">
                <input ref={e => this.inputEl = e} type={'text'} defaultValue={lodash.isNumber(props.value)?props.value.toString() : ''}
                    disabled={props.disabled ? true : false}
                    placeholder={props.placeholder}
                    onInput={e => onInput(e)}
                    onKeyDown={e => keydown(e)}
                    readOnly={props.readonly}
                    name={props.name}
                ></input>
                <div className="pos pos-center-right h-24 w-20 flex flex-col visible">
                    <span className="size-12 flex-center item-hover round cursor" onMouseDown={e => onDeep(1)}><Icon size={12} icon={UpSvg}></Icon></span>
                    <span className="size-12 flex-center item-hover round cursor" onMouseDown={e => onDeep(-1)}><Icon size={12} icon={DownSvg}></Icon></span>
                </div>
            </div>
        </div>
    }
}