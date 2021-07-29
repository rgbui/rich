import React, { CSSProperties } from "react";
export function Switch(props: {
    checked: boolean,
    onChange: (checked: boolean) => void,
    style?: CSSProperties,
    disabled?: boolean
}) {
    return <div style={props.style || {}} className={'sy-switch' + (props.checked ? " checked" : "") + (props.disabled == true ? " disabled" : "")} onMouseDown={e => props.disabled == true ? undefined : props.onChange(!props.checked)}>
    </div>
}