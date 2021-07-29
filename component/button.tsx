import React from "react";
import { Icon } from "./icon";
export function Button(props: {
    children: JSX.Element | string,
    icon?: string | SvgrComponent | JSX.Element,
    disabled: boolean,
    onClick?: (event: React.MouseEvent) => void,
    block?: boolean,
    ghost?: boolean
}) {
    var btn = <button
        className={'sy-button' + (props.ghost ? " sy-button-ghost" : "")}
        disabled={props.disabled ? props.disabled : false}
        onClick={e => props.onClick ? props.onClick(e) : undefined}
    >{props.icon && <Icon icon={props.icon}></Icon>}<span>{props.children}</span></button>;
    if (props.block) return <div className='sy-button-block'>{btn}</div>
    else return btn
}