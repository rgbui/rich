import React, { CSSProperties } from "react";
export function Switch(props: {
    checked: boolean,
    onChange: (checked: boolean) => void,
    style?: CSSProperties, className?: string | (string[]),
    disabled?: boolean
}) {
    function down(event: React.MouseEvent) {

        if (props.disabled !== false) {
            props.onChange(!props.checked)
        }
    }
    var classList: string[] = ['shy-switch'];
    if (props.checked) classList.push('checked')
    if (props.disabled) classList.push('disabled')
    return <div style={props.style || {}}
        className={classList.join(" ")}
        onMouseDown={e => down(e)}>
        <em></em>
    </div>
}