import React, { CSSProperties } from "react";
import { CloseSvg } from "../../svgs";
import { Icon } from "../icon";
import { MenuItem } from "../menu/declare";
import { KeyboardCode } from "../../../src/common/keys";
import "./style.less";

export class Input extends React.Component<{
    style?: CSSProperties,
    inputStyle?: CSSProperties,
    disabled?: boolean,
    noborder?: boolean,
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
    inputClassName?: string | (string[]),
    onMousedown?: (event: React.MouseEvent) => void,
    prefix?: React.ReactNode,
    onSearchDrop?: (value: string) => Promise<MenuItem[]>,
    onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void
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
    drop: {
        items: MenuItem[],
        index: number,
        visible: boolean
    } = {
            items: [],
            index: 0,
            visible: false
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
        async function keydown(e: React.KeyboardEvent) {
            if (self.drop.visible) {
                if (e.key == KeyboardCode.ArrowDown) {
                    self.drop.index++;
                    if (self.drop.index >= self.drop.items.length) self.drop.index = 0;
                    self.forceUpdate();
                    return;
                }
                else if (e.key == KeyboardCode.ArrowUp) {
                    self.drop.index--;
                    if (self.drop.index < 0) self.drop.index = self.drop.items.length - 1;
                    self.forceUpdate();
                    return;
                }
            }
            if (self.props.onSearchDrop) {
                var items = await self.props.onSearchDrop((e.target as HTMLInputElement).value);
                if (items) {
                    self.drop.items = items;
                    self.drop.visible = true;
                }
                else {
                    self.drop.items = [];
                    self.drop.visible = false;
                }
                self.forceUpdate();
            }
            if (self.drop.visible && e.key == KeyboardCode.Enter) {
                if (self.drop.items[self.drop.index]) {
                    self.updateValue(self.drop.items[self.drop.index].value);
                    props.onEnter && props.onEnter(self.drop.items[self.drop.index].value);
                    self.drop.visible = false;
                    self.forceUpdate()
                    return;
                }
            }
            if(e.key == KeyboardCode.Enter && props.onEnter) {
                props.onEnter(filterValue((e.target as HTMLInputElement).value), e);
            }
            else if (props.onKeydown) props.onKeydown(e);
        }
        var classList: string[] = ['shy-input', 'flex', 'round-3'];
        if (this.props.onSearchDrop) classList.push('relative');
        if (this.props.size == 'small') classList.push('small')
        else if (this.props.size == 'larger') classList.push('larger')
        if (Array.isArray(this.props.className)) this.props.className.each(c => { classList.push(c) })
        else if (this.props.className) classList.push(this.props.className)
        if (this.props.noborder) classList.push('shy-input-noborder');

        var inputClassList: string[] = [];
        if (Array.isArray(this.props.inputClassName)) this.props.inputClassName.each(c => { inputClassList.push(c) })
        else if (this.props.inputClassName) inputClassList.push(this.props.inputClassName)

        return <div
            onMouseDown={e => {
                props.onMousedown && props.onMousedown(e)
            }}
            className={classList.join(" ")}
            style={props.style || {}}>
            {props.prefix && <div className="shy-input-prefix flex-center flex-fixed">
                {props.prefix}
            </div>}
            <div className="shy-input-wrapper flex-auto">
                <input
                    className={inputClassList.join(" ")}
                    ref={e => this.inputEl = e}
                    type={props.type || 'text'}
                    defaultValue={props.value || ''}
                    disabled={props.disabled ? true : false}
                    placeholder={props.placeholder}
                    onInput={e => onInput(e)}
                    onBlur={e => {
                        if (props.onBlur)
                            props?.onBlur(e)
                    }}
                    onPaste={e => {
                        e.stopPropagation();
                    }}
                    onKeyDown={e => keydown(e)}
                    readOnly={props.readonly}
                    maxLength={props.maxLength || undefined}
                    name={props.name}
                    style={{
                        textIndent: props.prefix ? 0 : 4,
                        ...(props.inputStyle || {})
                    }}
                ></input>
            </div>
            {props.clear && this.props.value && <div className="shy-input-clear flex-fixed" onClick={e => this.onClear()}>
                <div className="size-20 flex-center item-hover circle cursor "><Icon size={12} icon={CloseSvg}></Icon></div>
            </div>}
            {this.drop?.items && this.drop?.items?.length > 0 && this.drop.visible && <div style={{ top: 30 }} className="pos pos-top-full padding-h-10 round bg-white shadow">
                {this.drop.items.map((item, i) => {
                    return <div onMouseDown={e => {
                        e.stopPropagation();
                        this.updateValue(item.value);
                        props.onChange && props.onChange(item.value);
                        this.drop.visible = false;
                        this.forceUpdate()
                    }} key={i} className={"flex padding-w-10 round item-light-hover h-24 gap-h-3 " + (this.drop.index == i ? " item-hover-focus" : "")}>{item.icon && <span className="size-24 flex-center"><Icon size={16} icon={item.icon}></Icon></span>}<span className="flex-auto">{item.text}</span></div>
                })}
            </div>}
        </div>
    }
    updateValue(value) {
        if (this.inputEl)
            this.inputEl.value = value;
    }
    focus() {
        this.inputEl.focus()
    }
}


