import lodash from 'lodash';
import React, { CSSProperties } from 'react';
import { Block } from '..';
import { BlockAppear } from '../appear';
export function TextArea(props: {
    block: Block,
    prop?: string,
    html?: string,
    placeholder?: string,
    style?: CSSProperties,
    default?: string,
}) {
    var prop = props.prop;
    if (typeof prop == 'undefined') prop = 'content';
    var ps = {
        ref: (e) => props.block.elementAppear({ el: e, prop: props.prop, appear: BlockAppear.text }),
        style: props.style,
        placeholder: props.placeholder
    };
    var html = props.html;
    if (typeof html == 'undefined') html = lodash.get(props.block, props.prop);
    if (html == '' && typeof props.default != 'undefined') html = props.default;
    return <span className='shy-appear-text'
        {...ps}
        dangerouslySetInnerHTML={{ __html: html }}></span>
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
    return <div className='shy-appear-texts'  {...ps} >{props.childs.map(x => {
        if (!x) console.trace(x);
        if (!x.viewComponent) console.error(x);
        return <x.viewComponent key={x.id} block={x}></x.viewComponent>
    })}</div>
}
export function TextSpanArea(props: { block: Block, placeholder?: string }) {
    if (props.block.childs.length > 0)
        return <TextLineChilds childs={props.block.childs}></TextLineChilds>
    else
        return <TextArea block={props.block} prop='content' placeholder={props.placeholder || '键入文字或"/"选择'}></TextArea>
}

