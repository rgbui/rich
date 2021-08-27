import React, { CSSProperties } from 'react';
import { Block } from '..';
export function TextArea(props: {
    html: string,
    placeholder?: string,
    ref?: (e: HTMLElement) => void,
    style?: CSSProperties
}) {
    return <span className='sy-appear-text'
        ref={props?.ref}
        style={props.style || {}}
        placeholder={props.placeholder}
        dangerouslySetInnerHTML={{ __html: props.html }}></span>
}
export function SolidArea(props: {
    children: React.ReactNode,
    ref?: (e: HTMLElement) => void
    style?: CSSProperties
}) {
    return <div className='sy-appear-solid' ref={props?.ref}
        style={props.style || {}}>{props.children}</div>
}
export function ChildsArea(props: { childs: Block[] }) {
    return <>{props.childs.map(x => {
        if (!x) console.trace(x);
        if (!x.viewComponent) console.error(x);
        return <x.viewComponent key={x.id} block={x}></x.viewComponent>
    })}</>
}
export function TextLineChilds(props: {
    childs: Block[], ref?: (e: HTMLElement) => void,
    style?: CSSProperties
}) {
    return <span className='sy-appear-texts' style={props.style || {}} ref={e => props?.ref(e)}>{props.childs.map(x => {
        if (!x) console.trace(x);
        if (!x.viewComponent) console.error(x);
        return <x.viewComponent key={x.id} block={x}></x.viewComponent>
    })}</span>
}