
import React from 'react';
export function Icon(props: {
    icon: string | SvgrComponent,
    click?: (e: MouseEvent) => void,
    mousedown?: (e: MouseEvent) => void,
    rotate?: number,
    size?: number,
    className?: string[] | string
}) {
    if (typeof props.icon == 'undefined' || !props.icon) {
        return <i>图标不能为空</i>
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
            fontSize: 20,
            lineHeight: 20,
            width: 20 || props.size,
            height: 20 || props.size
        });
        return <i className={classList.join(" ")}
            onClick={e => { props.click ? props.click(e.nativeEvent) : undefined; }}
            onMouseDown={e => { props.mousedown ? props.mousedown(e.nativeEvent) : undefined }}
            style={style}></i>
    }
    else {
        Object.assign(style, {
            width: 20 || props.size,
            height: 20 || props.size
        })
        return <props.icon className={classList.join(" ")}
            onClick={e => { props.click ? props.click(e.nativeEvent) : undefined; }}
            onMouseDown={e => { props.mousedown ? props.mousedown(e.nativeEvent) : undefined }}
            style={style}></props.icon>
    }
}