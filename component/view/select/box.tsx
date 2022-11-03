import lodash from "lodash";
import React, { CSSProperties } from "react"
import { Rect } from "../../../src/common/vector/point";
import { ChevronDownSvg } from "../../svgs";
import { Icon } from "../icon";
import { useSelectMenuItem } from "../menu";
import { MenuItem } from "../menu/declare";

export class SelectBox extends React.Component<{
    children?: JSX.Element | string | React.ReactNode,
    disabled?: boolean,
    inline?: boolean,
    value?: any,
    className?: string | (string[]),
    options?: MenuItem<string>[],
    computedOptions?: () => Promise<MenuItem<string>[]>,
    onChange?: (value: any, item: MenuItem<string>) => void,
    style?: CSSProperties,
    dropHeight?: number,
    border?: boolean,
    width?: number,
    small?: boolean
}>{
    render() {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            if (self.props.disabled) return;
            var options = typeof self.props.computedOptions == 'function' ? await self.props.computedOptions() : self.props.options;
            var ms = lodash.cloneDeep(options);
            var op = ms.arrayJsonFind('childs', g => g.value == self.props.value);
            if (op) op.checkLabel = true;
            var r = await useSelectMenuItem(
                { roundArea: Rect.fromEvent(event) },
                ms,
                {
                    width: self.props.width || 160,
                    nickName: 'selectBox'
                });
            if (r) {
                if (typeof self.props.onChange == 'function')
                    self.props.onChange(r.item.value, r.item);
            }
        }
        var classList: string[] = ['shy-select-box'];
        if (this.props.disabled) classList.push("disabled")
        if (this.props.border) classList.push('border')
        if (this.props.small) classList.push('small')
        if (Array.isArray(this.props.className)) this.props.className.each(c => { classList.push(c) })
        else if (this.props.className) classList.push(this.props.className)
        var op = this.props.options.arrayJsonFind('childs', g => g.value == this.props.value);
        var style = this.props.style || {};
        if (this.props.inline) style.display = 'inline-flex';
        return <div style={style}
            className={classList.join(" ")}
            onMouseDown={e => mousedown(e)}>
            {this.props.children && <>{this.props.children}<Icon className={'gap-l-3'} size={12} icon={ChevronDownSvg}></Icon></>}
            {!this.props.children && <><span>{op?.icon && <Icon size={14} icon={op.icon}></Icon>}{op?.text}</span><Icon className={'gap-l-3'} size={12} icon={ChevronDownSvg}></Icon></>}
        </div>
    }
}