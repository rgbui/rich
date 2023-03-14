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
    border?: boolean,
    dropWidth?: number,
    small?: boolean,
    multiple?: boolean
}>{
    render() {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            event.stopPropagation();
            if (self.props.disabled) return;
            var options = typeof self.props.computedOptions == 'function' ? await self.props.computedOptions() : self.props.options;
            var ms = lodash.cloneDeep(options);
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
            var r = await useSelectMenuItem(
                { roundArea: Rect.fromEvent(event) },
                ms,
                {
                    width: self.props.dropWidth || 160,
                    nickName: 'selectBox'
                });
            if (r) {
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
        return <div style={style}
            className={classList.join(" ")}
            onMouseDown={e => mousedown(e)}>
            {this.props.children && <>{this.props.children}<Icon className={'gap-l-3'} size={12} icon={ChevronDownSvg}></Icon></>}
            {!this.props.children && <div style={{ width: '100%' }} className="flex">
                {this.props.multiple != true && <span className="flex-auto">{op?.icon && <Icon size={14} icon={op.icon}></Icon>}{op?.text}</span>}
                {this.props.multiple == true && <span className="flex-auto"><span>{ops.map((op, i) => {
                    return <span className={'padding-w-5 round padding-h-2 ' + (i == ops.length - 1 ? "" : "gap-r-3")} key={op.value}><span>{op?.icon && <Icon size={14} icon={op.icon}></Icon>}{op?.text}</span></span>
                })}</span></span>}
                <Icon className={'flex-fixed gap-l-3'} size={12} icon={ChevronDownSvg}></Icon></div>}
        </div>
    }
}