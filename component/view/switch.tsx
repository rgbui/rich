import React, { CSSProperties } from "react";

export function Switch(props: {
    checked: boolean,
    onChange: (checked: boolean) => void,
    style?: CSSProperties, className?: string | (string[]),
    disabled?: boolean,
    size?: 'small'
}) {
    function down(event: React.MouseEvent) {
        if (props.disabled !== false) {
            props.onChange(!props.checked)
        }
    }
    var classList: string[] = ['shy-switch'];
    if (props.checked) classList.push('checked')
    if (props.disabled) classList.push('disabled')
    if (props.size == 'small') classList.push('shy-switch-small')
    return <div style={props.style || {}}
        className={classList.join(" ")}
        onMouseDown={e => down(e)}>
        <em></em>
    </div>
}

export function SwitchText(props: {
    text?: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
    style?: CSSProperties, className?: string | (string[]),
    disabled?: boolean,
    size?: 'small',
    children?: React.ReactNode,
    align?: 'right' | 'left'
}) {
    var classList: string[] = ['inline-flex'];
    var style: CSSProperties = {
        // display: 'inline-block'
    }
    if (props.align == 'left' || !props.align)
        return <div className={classList.join(' ')} style={style}>
            <label className="gap-r-5">{props.text || props.children}</label>
            <Switch {...props}></Switch>
        </div>
    else if (props.align == 'right') {
        return <div className={classList.join(' ')} style={style}>
            <Switch {...props}></Switch>
            <label className="gap-l-5">{props.text || props.children}</label>
        </div>
    }
}