import lodash from 'lodash';
import React, { CSSProperties } from 'react';
import { Block } from '..';
import { BlockAppear } from '../appear';
export function TextArea(props: {
    block: Block,
    prop?: string,
    html?: string,
    /**是否为纯文本 */
    plain?: boolean,
    placeholder?: string,
    style?: CSSProperties,
    default?: string,
}) {
    var prop = props.prop;
    if (typeof prop == 'undefined') prop = 'content';
    var ps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> = {
        ref: (e) => props.block.elementAppear({
            el: e,
            prop: props.prop,
            appear: BlockAppear.text,
            plain: props.plain,
            defaultValue: props.default
        }),
        style: props.style,
        placeholder: props.placeholder,
        contentEditable: props.block.isCanEdit(props.prop) ? true : undefined,
        spellCheck: false,
        onMouseDown: (e) => props.block.elementAppearEvent(props.prop, 'mousedown', e),
        onMouseUp: (e) => props.block.elementAppearEvent(props.prop, 'mouseup', e),
        onFocus: (e) => props.block.elementAppearEvent(props.prop, 'focus', e),
        onBlur: (e) => props.block.elementAppearEvent(props.prop, 'blur', e),
        onKeyDown: (e) => props.block.elementAppearEvent(props.prop, 'keydown', e),
        onInput: (e) => props.block.elementAppearEvent(props.prop, 'input', e),
        onPaste: (e) => props.block.elementAppearEvent(props.prop, 'paste', e),
        onDoubleClick: (e) => props.block.elementAppearEvent(props.prop, 'dblclick', e),
        onCompositionStart: (e) => props.block.elementAppearEvent(props.prop, 'compositionstart', e),
        onCompositionEnd: (e) => props.block.elementAppearEvent(props.prop, 'compositionend', e),
        onCompositionUpdate: (e) => props.block.elementAppearEvent(props.prop, 'compositionupdate', e)
    };
    var html = props.html;
    if (typeof html == 'undefined') html = lodash.get(props.block, props.prop);
    if (html == '' && typeof props.default != 'undefined') html = props.default;
    return <span className='shy-appear-text'
        suppressContentEditableWarning
        {...ps}
    >{html}</span>
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
export function TextSpanArea(props: { block: Block, prop?: string, placeholder?: string }) {
    if (props.block.childs.length > 0)
        return <TextLineChilds childs={props.block.childs}></TextLineChilds>
    else
        return <TextArea block={props.block} prop={props.prop || 'content'} placeholder={props.placeholder || '键入文字或"/"选择'}></TextArea>
}

