
import React, { CSSProperties } from 'react';
import { IconArguments } from '../../extensions/icon/declare';
import { getEmoji } from '../../net/element.type';
import { PageSvg } from '../svgs';

export function Icon(props: {
    icon: string | SvgrComponent | JSX.Element | IconArguments,
    onClick?: (e: React.MouseEvent) => void,
    onMousedown?: (e: React.MouseEvent) => void,
    rotate?: number,
    size?: number | 'none',
    fontSize?: number,
    className?: string[] | string,
    style?: CSSProperties,
    wrapper?: boolean
}) {
    if (typeof props.icon == 'undefined' || !props.icon) {
        return <i>the icon is empty</i>
    }
    var classList: string[] = ['shy-icon'];
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
        var fs = props.fontSize || props.size;
        if (fs == 'none') fs = undefined;
        Object.assign(style, {
            fontSize: fs ? fs : undefined,
            lineHeight: fs ? (fs + 'px') : undefined,
            width: props.size == 'none' ? undefined : (props.size) || 20,
            height: props.size == 'none' ? undefined : (props.size) || 20,
            ...(props.style || {})
        });
        return <i className={classList.join(" ")}
            onClick={e => { props.onClick ? props.onClick(e) : undefined; }}
            onMouseDown={e => { props.onMousedown ? props.onMousedown(e) : undefined }}
            style={style}></i>
    }
    else if (typeof props.icon == 'function') {
        Object.assign(style, {
            width: props.size == 'none' ? undefined : (props.size) || 20,
            height: props.size == 'none' ? undefined : (props.size) || 20
            , ...(props.style || {})
        })
        if (props.wrapper) {
            return <div className={classList.join(" ")}
                onClick={e => { props.onClick ? props.onClick(e) : undefined; }}
                onMouseDown={e => { props.onMousedown ? props.onMousedown(e) : undefined }}
                style={style}>
                <props.icon style={{ width: '100%', height: '100%' }}></props.icon>
            </div>
        }
        else {
            return <props.icon className={classList.join(" ")}
                onClick={e => { props.onClick ? props.onClick(e) : undefined; }}
                onMouseDown={e => { props.onMousedown ? props.onMousedown(e) : undefined }}
                style={style}></props.icon>
        }
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
                return <span className={classList.join(" ")} style={style} onClick={e => { props.onClick ? props.onClick(e) : undefined; }}
                    onMouseDown={e => { props.onMousedown ? props.onMousedown(e) : undefined }}>
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
                classList.push('ef');
                return <span onClick={e => { props.onClick ? props.onClick(e) : undefined; }}
                    onMouseDown={e => { props.onMousedown ? props.onMousedown(e) : undefined }} dangerouslySetInnerHTML={{ __html: getEmoji(pc.code) }} className={classList.join(" ")} style={style}>
                </span>
                break;
            case 'image':
            case 'link':
                Object.assign(style, {
                    width: props.size == 'none' ? undefined : (props.size) || 20,
                    height: props.size == 'none' ? undefined : (props.size) || 20
                    , ...(props.style || {})
                });
                return <img onClick={e => { props.onClick ? props.onClick(e) : undefined; }}
                    onMouseDown={e => { props.onMousedown ? props.onMousedown(e) : undefined }} src={pc.url} className={classList.join(" ")} style={style} />
            case 'none':
                Object.assign(style, {
                    width: props.size == 'none' ? undefined : (props.size) || 20,
                    height: props.size == 'none' ? undefined : (props.size) || 20
                    , ...(props.style || {})
                });
                return <PageSvg style={style}></PageSvg>
        }
    }
    else {
        Object.assign(style, {
            width: props.size == 'none' ? undefined : (props.size) || 20,
            height: props.size == 'none' ? undefined : (props.size) || 20
            , ...(props.style || {})
        })
        return <span onClick={e => { props.onClick ? props.onClick(e) : undefined; }}
            onMouseDown={e => { props.onMousedown ? props.onMousedown(e) : undefined }} className={classList.join(" ")} style={style}>{props.icon}</span>
    }
}

export function IconButton(props: {
    icon: string | SvgrComponent | JSX.Element | IconArguments,
    click?: (e: React.MouseEvent) => void,
    onMouseDown?: (e: React.MouseEvent) => void,
    rotate?: number,
    size?: number | 'none',
    fontSize?: number,
    className?: string[] | string,
    style?: CSSProperties,
    width: number,
    wrapper?: boolean
}) {
    var style: CSSProperties = {
        width: props.width,
        height: props.width
    }
    var iconProps = {
        icon: props.icon,
        rotate: props.rotate,
        size: props.size,
        fontSize: props.fontSize,
        style: props.style,
        wrapper: props.wrapper
    }
    return <div style={style} onMouseDown={e => props.onMouseDown ? props.onMouseDown(e) : undefined} className='shy-icon-button'><Icon {...iconProps}></Icon></div>
}