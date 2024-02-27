
import lodash from "lodash";
import React, { CSSProperties } from "react"
import { Rect } from "../../../src/common/vector/point";
import { ChevronDownSvg } from "../../svgs";
import { Icon } from "../icon";
import { useSelectMenuItem } from "../menu";
import { MenuItem } from "../menu/declare";

export class SelectBox<T = any> extends React.Component<{
    children?: JSX.Element | string | React.ReactNode,
    disabled?: boolean,
    inline?: boolean,
    value?: T | (T[]),
    className?: string | (string[]),
    options?: MenuItem<string>[],
    computedOptions?: () => Promise<MenuItem<string>[]>,
    computedChanges?: (values: T[], value: T) => Promise<T[]>,
    onChange?: (value: any, item?: MenuItem<string>) => void,
    style?: CSSProperties,
    dropHeight?: number,
    dropAlign?: 'left' | 'right' | 'full',
    border?: boolean,
    dropWidth?: number,
    small?: boolean,
    multiple?: boolean,
    iconHidden?: boolean,
    prefix?: JSX.Element | string | React.ReactNode,
    textAlign?: 'left' | 'center' | 'right',
    placeholder?: string,
    checkChange?: (value: any, item?: MenuItem<string>) => Promise<boolean>,
    onDrop?: (spread?: boolean, e?: React.MouseEvent) => void
}>{
    el: HTMLElement;
    render() {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            event.stopPropagation();
            if (self.props.disabled) return;
            var options = typeof self.props.computedOptions == 'function' ? await self.props.computedOptions() : self.props.options;
            var ms = options.exists(g => g.render ? true : false) ? options : lodash.cloneDeep(options);
            if (self.props.multiple == true) {
                var ops = ms.arrayJsonFindAll('childs', g => Array.isArray(self.props.value) && self.props.value.includes(g.value));
                ops.forEach(op => {
                    op.checkLabel = true;
                })
            }
            else {
                var op = ms.arrayJsonFind('childs', g => g.value == self.props.value);
                if (op) op.checkLabel = true;
            }
            if (self.props.onDrop)
                self.props.onDrop(true, event);
            var rect = Rect.fromEle(event.currentTarget as HTMLElement)
            var r = await useSelectMenuItem(
                { roundArea: rect, align: self.props.dropAlign == 'left' || self.props.dropAlign == 'full' ? 'start' : 'end' },
                ms,
                {
                    width: self.props.dropAlign == 'full' ? rect.width : (self.props.dropWidth || 160),
                    nickName: 'selectBox'
                });
            if (r) {
                if (typeof self.props.checkChange == 'function') {
                    var cc = await self.props.checkChange(r.item.value, r.item);
                    if (cc === false) return;
                }
                if (self.props.multiple) {
                    var vs = lodash.cloneDeep(self.props.value || []) as T[];
                    if (typeof self.props.computedChanges == 'function') {
                        vs = await self.props.computedChanges(vs, r.item.value)
                    }
                    else {
                        if (vs.includes(r.item.value)) lodash.remove(vs, c => c == r.item.value)
                        else vs.push(r.item.value);
                    }
                    if (typeof self.props.onChange == 'function') self.props.onChange(vs as any, r.item)
                }
                else {
                    if (typeof self.props.onChange == 'function')
                        self.props.onChange(r.item.value, r.item);
                }
            }
            if (self.props.onDrop)
                self.props.onDrop(false, event)
        }
        var classList: string[] = ['shy-select-box'];
        if (this.props.disabled) classList.push("disabled")
        if (this.props.border) classList.push('border')
        if (this.props.small) classList.push('small')
        if (Array.isArray(this.props.className)) this.props.className.each(c => { classList.push(c) })
        else if (this.props.className) classList.push(this.props.className)
        var ops = this.props.options.arrayJsonFindAll('childs', g => Array.isArray(this.props.value) && this.props.value.includes(g.value))
        var op = this.props.options.arrayJsonFind('childs', g => g.value == this.props.value);
        var style = this.props.style || {};
        if (this.props.inline) style.display = 'inline-flex';
        style.boxSizing = 'border-box';
        return <div ref={e => { this.el = e; }} style={style}
            className={classList.join(" ")}
            onMouseDown={e => mousedown(e)}>
            {this.props.children && <>{this.props.children}<Icon className={'gap-l-3 remark'} size={14} icon={ChevronDownSvg}></Icon></>}
            {!this.props.children && <div style={{ width: '100%' }} className="flex">
                {this.props.prefix}
                {this.props.multiple != true && <span style={{ justifyContent: this.props.textAlign == 'right' ? "flex-end" : undefined }} className={'flex f-14 ' + (this.props.border ? "flex-auto " : "flex-fixed") + (op?.text ? "" : " remark")}>{op?.icon && this.props.iconHidden !== true && <Icon size={op?.iconSize || 14} className={'gap-r-3'} icon={op.icon}></Icon>}{op?.text || this.props.placeholder}</span>}
                {this.props.multiple == true && <span className={'f-14 flex ' + (this.props.border ? "flex-auto" : "flex-fixed")}><span>{ops.map((op, i) => {
                    return <span className={'round padding-h-2 ' + (i == 0 && this.props.prefix ? "gap-l-5" : (i == 0 ? "" : "padding-l-5 "))} key={op.value}><span className={"flex " + (i < ops.length - 1 ? "gap-r-3" : "")}>{op?.icon && <Icon size={op?.iconSize || 14} className={'gap-r-3'} icon={op.icon}></Icon>}{op?.text}</span>{i < ops.length - 1 ? "," : ""}</span>
                })}</span></span>}
                <span className="flex-fixed size-14 gap-l-3 remark flex-center">
                    <Icon size={14} icon={ChevronDownSvg}></Icon>
                </span>
            </div>}
        </div>
    }
}