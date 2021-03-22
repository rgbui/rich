
import React from 'react';
export function Icon(props: {
    icon: string,
    click?: (e: MouseEvent) => void,
    mousedown?: (e: MouseEvent) => void,
    rotate?: number
}) {
    var classList: string[] = ['sy-icon'];
    if (props.icon.indexOf(':')) {
        var [name, prefix] = props.icon.split(':');
        classList.push(prefix);
        classList.push(prefix + '-' + name);
    }
    var style: Record<string, any> = {
        fontSize: 'inherit',
        color: 'inherit',
        fontStyle: 'normal'
    };
    return <i className={classList.join(" ")}
        onClick={e => { props.click ? props.click(e.nativeEvent) : undefined; }}
        onMouseDown={e => { props.mousedown ? props.mousedown(e.nativeEvent) : undefined }}
        style={style}></i>
}