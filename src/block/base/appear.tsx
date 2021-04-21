import React from 'react';
import { Block } from '..';
export function TextArea(props: {
    html: string,
    placeholder?:string
}) {
    return <span className='sy-appear-text' placeholder={props.placeholder} dangerouslySetInnerHTML={{ __html: props.html }}></span>
}
export function SolidArea(props: { content: JSX.Element | (JSX.Element[]) }) {
    return <div className='sy-appear-solid'>{props.content}</div>
}
export function ChildsArea(props: { childs: Block[] }) {
    return <>{props.childs.map(x => {
        if (!x) console.trace(x);
        if (!x.viewComponent) console.error(x);
        return <x.viewComponent key={x.id} block={x}></x.viewComponent>
    })}</>
}