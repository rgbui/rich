import React, { CSSProperties } from "react";
import { Icon } from "./icon";
export class Button extends React.Component<{
    children?: JSX.Element | string,
    icon?: string | SvgrComponent | JSX.Element,
    disabled?: boolean,
    onClick?: (event: React.MouseEvent) => void,
    block?: boolean,
    ghost?: boolean,
    style?: CSSProperties
}>{
    render() {
        var props = this.props;
        var btn = <button style={this.props.style || {}}
            className={'shy-button' + (props.ghost ? " shy-button-ghost" : "")}
            disabled={props.disabled ? props.disabled : false}
            onClick={e => props.onClick ? props.onClick(e) : undefined}
        >{props.icon && <Icon icon={props.icon}></Icon>}<span>{props.children}</span></button>;
        if (props.block) return <div style={this.props.style || {}} className='shy-button-block'>{btn}</div>
        else return btn
    }
}

