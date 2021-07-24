
import React from 'react';
export function Icon(props: {
    icon: string | SvgrComponent | JSX.Element,
    click?: (e: MouseEvent) => void,
    mousedown?: (e: MouseEvent) => void,
    rotate?: number,
    size?: number | 'none',
    className?: string[] | string
}) {
    if (typeof props.icon == 'undefined' || !props.icon) {
        return <i>the icon is empty</i>
    }
    var classList: string[] = ['sy-icon'];
    if (typeof props.icon == 'string' && props.icon.indexOf(':')) {
        var [name, prefix] = props.icon.split(':');
        classList.push(prefix);
        classList.push(prefix + '-' + name);
    }
    if (Array.isArray(props.className)) {
        classList.addRange(props.className);
    }
    else if (typeof props.className == 'string') classList.push(props.className)
    var style: Record<string, any> = {};
    if (typeof props.icon == 'string') {
        Object.assign(style, {
            fontSize: props.size == 'none' ? undefined : 20,
            lineHeight: props.size == 'none' ? undefined : '20px',
            width: props.size == 'none' ? undefined : (props.size) || 20,
            height: props.size == 'none' ? undefined : (props.size) || 20
        });
        return <i className={classList.join(" ")}
            onClick={e => { props.click ? props.click(e.nativeEvent) : undefined; }}
            onMouseDown={e => { props.mousedown ? props.mousedown(e.nativeEvent) : undefined }}
            style={style}></i>
    }
    else if (typeof props.icon == 'function') {
        Object.assign(style, {
            width: props.size == 'none' ? undefined : (props.size) || 20,
            height: props.size == 'none' ? undefined : (props.size) || 20
        })
        return <props.icon className={classList.join(" ")}
            onClick={e => { props.click ? props.click(e.nativeEvent) : undefined; }}
            onMouseDown={e => { props.mousedown ? props.mousedown(e.nativeEvent) : undefined }}
            style={style}></props.icon>
    }
    else {
        Object.assign(style, {
            width: props.size == 'none' ? undefined : (props.size) || 20,
            height: props.size == 'none' ? undefined : (props.size) || 20
        })
        return <span className={classList.join(" ")} style={style}>{props.icon}</span>
    }
}