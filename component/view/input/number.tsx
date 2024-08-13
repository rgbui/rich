import React, { CSSProperties } from "react";
import { DownSvg, UpSvg } from "../../svgs";
import { Icon } from "../icon";
import lodash from "lodash";

export class InputNumber extends React.Component<{
    style?: CSSProperties,
    inputStyle?: CSSProperties,
    disabled?: boolean,
    value?: number,
    showIcon?:boolean,
    placeholder?: string,
    readonly?: boolean,
    noborder?: boolean,
    onChange?: (value: number, e?: React.FormEvent<HTMLInputElement>) => void,
    onEnter?: (value: number, e?: React.KeyboardEvent) => void,
    onDeep?: (increase: number) => void,
    name?: string,
    size?: 'small' | 'default' | 'larger', className?: string | (string[]),

}> {
    private inputEl: HTMLInputElement;
    render() {
        var self = this;
        var props = this.props;
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
                if (props.onDeep) props.onDeep(v +increase);
                else props.onChange(v + increase);
                self.inputEl.value = (v + increase).toString();
            }
            else if (lodash.isUndefined(v)) {
                if (props.onDeep) props.onDeep(null)
                else props.onChange(null);
            }
        }
        function keydown(e: React.KeyboardEvent<HTMLInputElement>) {
            if (e.key == 'Enter' && props.onEnter) {
                var v = filterValue((e.target as HTMLInputElement).value);
                if (typeof v == 'number') props.onEnter(v, e);
                else if (lodash.isUndefined(v)) { props.onChange(null); }
            }
        }
        var classList: string[] = ['shy-input', 'relative', 'visible-hover'];
        if (Array.isArray(this.props.className)) this.props.className.each(c => { classList.push(c) })
        else if (this.props.className) classList.push(this.props.className)
        if (props.size == 'small') classList.push('small');
        else if (props.size == 'larger') classList.push('larger');
        if (this.props.noborder) classList.push('shy-input-noborder');

        return <div
            className={classList.join(" ")}
            style={props.style || {}}>
            <div className="shy-input-wrapper">
                <input ref={e => this.inputEl = e}
                    type={'text'}
                    defaultValue={lodash.isNumber(props.value) ? props.value.toString() : ''}
                    disabled={props.disabled ? true : false}
                    placeholder={props.placeholder}
                    onInput={e => onInput(e)}
                    onKeyDown={e => keydown(e)}
                    readOnly={props.readonly}
                    name={props.name}
                    style={props.inputStyle || {}}
                ></input>
                <div className={"pos pos-center-right h-24 w-20 flex flex-col "+(props.showIcon?" ":"visible")}>
                    <span className="size-12 flex-center item-hover round cursor" onMouseDown={e => { e.stopPropagation(); onDeep(1) }}><Icon size={12} icon={UpSvg}></Icon></span>
                    <span className="size-12 flex-center item-hover round cursor" onMouseDown={e => { e.stopPropagation(); onDeep(-1) }}><Icon size={12} icon={DownSvg}></Icon></span>
                </div>
            </div>
        </div>
    }
    componentDidUpdate(prevProps: Readonly<{ style?: CSSProperties; inputStyle?: CSSProperties; disabled?: boolean; value?: number; placeholder?: string; readonly?: boolean; noborder?: boolean; onChange?: (value: number, e?: React.FormEvent<HTMLInputElement>) => void; onEnter?: (value: number, e?: React.KeyboardEvent) => void; name?: string; size?: "small" | "default" | "larger"; className?: string | (string[]); }>, prevState: Readonly<{}>, snapshot?: any): void {
        if (prevProps.value != this.props.value) {
            this.inputEl.value = lodash.isNumber(this.props.value) ? this.props.value.toString() : '';
        }
    }
}