
import React from 'react';
export function Icon(props: {
    icon: string,
    click?: (e: MouseEvent) => void,
    mousedown?: (e: MouseEvent) => void,
    rotate?: number,
    size?: number,
    className?: string[]|string
}) {
    var classList: string[] = ['sy-icon'];
    if (props.icon.indexOf(':')) {
        var [name, prefix] = props.icon.split(':');
        classList.push(prefix);
        classList.push(prefix + '-' + name);
    }
    if (Array.isArray(props.className)) {
        classList.addRange(props.className);
    }
    else if(typeof props.className=='string')classList.push(props.className)
    var style: Record<string, any> = {
        fontSize: props.size || 20,
        width: 20 || props.size,
        height: 20 || props.size
    };
    return <i className={classList.join(" ")}
        onClick={e => { props.click ? props.click(e.nativeEvent) : undefined; }}
        onMouseDown={e => { props.mousedown ? props.mousedown(e.nativeEvent) : undefined }}
        style={style}></i>
}