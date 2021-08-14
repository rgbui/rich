
import React, { CSSProperties } from 'react';
import { IconArguments } from '../extensions/icon/declare';
export function Icon(props: {
    icon: string | SvgrComponent | JSX.Element | IconArguments,
    click?: (e: React.MouseEvent) => void,
    mousedown?: (e: React.MouseEvent) => void,
    rotate?: number,
    size?: number | 'none',
    className?: string[] | string,
    style?: CSSProperties
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
            height: props.size == 'none' ? undefined : (props.size) || 20,
            ...(props.style || {})
        });
        return <i className={classList.join(" ")}
            onClick={e => { props.click ? props.click(e) : undefined; }}
            onMouseDown={e => { props.mousedown ? props.mousedown(e) : undefined }}
            style={style}></i>
    }
    else if (typeof props.icon == 'function') {
        Object.assign(style, {
            width: props.size == 'none' ? undefined : (props.size) || 20,
            height: props.size == 'none' ? undefined : (props.size) || 20
            , ...(props.style || {})
        })
        return <props.icon className={classList.join(" ")}
            onClick={e => { props.click ? props.click(e) : undefined; }}
            onMouseDown={e => { props.mousedown ? props.mousedown(e) : undefined }}
            style={style}></props.icon>
    }
    else if (typeof props.icon == 'object' && (props.icon as IconArguments).name) {
        var pc = props.icon as IconArguments;
        switch (pc.name) {
            case 'font-awesome':
                Object.assign(style, {
                    color: pc.color || '#000',
                    fontSize: props.size == 'none' ? undefined : props.size,
                    lineHeight: props.size == 'none' ? undefined : props.size + 'px',
                    width: props.size == 'none' ? undefined : (props.size) || 20,
                    height: props.size == 'none' ? undefined : (props.size) || 20
                    , ...(props.style || {})
                });
                return <span className={classList.join(" ")} style={style}>
                    <i className={'fa fa-' + pc.code}></i>
                </span>
                break;
            case 'emoji':
                Object.assign(style, {
                    color: '#000',
                    fill: '#000',
                    fontSize: props.size == 'none' ? undefined : props.size,
                    lineHeight: props.size == 'none' ? undefined : props.size + 'px',
                    width: props.size == 'none' ? undefined : (props.size) || 20,
                    height: props.size == 'none' ? undefined : (props.size) || 20
                    , ...(props.style || {})
                });
                return <span className={classList.join(" ")} style={style}>
                    {pc.code}
                </span>
                break;
            case 'image':
            case 'link':
                Object.assign(style, {
                    width: props.size == 'none' ? undefined : (props.size) || 20,
                    height: props.size == 'none' ? undefined : (props.size) || 20
                    , ...(props.style || {})
                });
                return <img src={pc.url} className={classList.join(" ")} style={style} />
        }
    }
    else {
        Object.assign(style, {
            width: props.size == 'none' ? undefined : (props.size) || 20,
            height: props.size == 'none' ? undefined : (props.size) || 20
            , ...(props.style || {})
        })
        return <span className={classList.join(" ")} style={style}>{props.icon}</span>
    }
}