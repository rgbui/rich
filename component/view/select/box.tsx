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
    value?: any,
    options: MenuItem<string>[],
    onChange?: (value: any, item: MenuItem<string>) => void,
    style?: CSSProperties,
    dropHeight?: number,
    border?: boolean
}>{
    render() {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            if (self.props.disabled) return;
            var ms = lodash.cloneDeep(self.props.options);
            var op = ms.arrayJsonFind('childs', g => g.value == self.props.value);
            if (op) op.checkLabel = true;
            var r = await useSelectMenuItem(
                { roundArea: Rect.fromEvent(event) },
                ms,
                {
                    width: 160,
                    nickName: 'selectBox'
                });
            if (r) {
                self.props.onChange(r.item.value, r.item);
            }
        }
        var op = this.props.options.arrayJsonFind('childs', g => g.value == this.props.value);
        return <div style={this.props.style || {}}
            className={"shy-select-box" + (this.props.disabled ? " disabled" : "") + (this.props.border ? " border" : "")}
            onMouseDown={e => mousedown(e)}>
            {this.props.children && <>{this.props.children}<Icon size={12} icon={ChevronDownSvg}></Icon></>}
            {!this.props.children && <><span>{op?.icon && <Icon size={14} icon={op.icon}></Icon>}{op?.text}</span><Icon size={12} icon={ChevronDownSvg}></Icon></>}
        </div>
    }
}