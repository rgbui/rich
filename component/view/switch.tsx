import React, { CSSProperties } from "react";
export function Switch(props: {
    checked: boolean,
    onChange: (checked: boolean) => void,
    style?: CSSProperties,
    disabled?: boolean
}) {
    function down(event: React.MouseEvent) {
       
        if (props.disabled !== false) {
            props.onChange(!props.checked)
        }
    }
    return <div style={props.style || {}}
        className={'shy-switch' + (props.checked ? " checked" : "") + (props.disabled == true ? " disabled" : "")}
        onMouseDown={e => down(e)}>
        <em></em>
    </div>
}