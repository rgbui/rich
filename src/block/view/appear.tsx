import React, { CSSProperties } from 'react';
import { Block } from '..';
export function TextArea(props: {
    html: string,
    placeholder?: string,
    rf?: (e: HTMLElement) => void,
    style?: CSSProperties
}) {
    var ps = { ref: props.rf, style: props.style, placeholder: props.placeholder };
    return <span className='shy-appear-text'
        {...ps}
        dangerouslySetInnerHTML={{ __html: props.html }}></span>
}
export function SolidArea(props: {
    children: React.ReactNode,
    rf?: (e: HTMLElement) => void
    style?: CSSProperties
}) {
    var ps = { ref: props.rf, style: props.style }
    return <div className='shy-appear-solid'  {...ps} >{props.children}</div>
}
export function ChildsArea(props: { childs: Block[] }) {
    return <>{props.childs.map(x => {
        if (!x) console.trace(x);
        if (!x.viewComponent) console.error(x);
        return <x.viewComponent key={x.id} block={x}></x.viewComponent>
    })}</>
}
export function TextLineChilds(props: {
    childs: Block[], rf?: (e: HTMLElement) => void,
    style?: CSSProperties
}) {
    var ps = { ref: props.rf, style: props.style }
    return <span className='shy-appear-texts'  {...ps} >{props.childs.map(x => {
        if (!x) console.trace(x);
        if (!x.viewComponent) console.error(x);
        return <x.viewComponent key={x.id} block={x}></x.viewComponent>
    })}</span>
}

