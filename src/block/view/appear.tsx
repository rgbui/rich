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
    isHtml?: boolean,
    isBlock?: boolean
}) {
    var prop = props.prop;
    if (typeof prop == 'undefined') prop = 'content';
    var ps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> = {
        style: props.style,
        placeholder: props.placeholder
    };
    if (props.block.isCanEdit(props.prop)) {
        ps = {
            ref: (e) => props.block.elementAppear({
                el: e,
                prop: props.prop,
                appear: BlockAppear.text,
                plain: props.plain,
                defaultValue: props.default
            }),
            suppressContentEditableWarning: true,
            style: props.style,
            placeholder: props.placeholder,
            contentEditable: true,
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
    }
    var html = props.html;
    if (typeof html == 'undefined') html = lodash.get(props.block, props.prop);
    if (html == '' && typeof props.default != 'undefined') html = props.default;
    if (props.isBlock) {
        if (props.isHtml) return <div className='shy-appear-text' dangerouslySetInnerHTML={{ __html: html }} {...(ps as any)}></div>
        return <div className='shy-appear-text' {...(ps as any)}>{html}</div>
    }
    else {
        if (props.isHtml) return <span className='shy-appear-text' dangerouslySetInnerHTML={{ __html: html }} {...ps}></span>
        return <span className='shy-appear-text' {...ps}>{html}</span>
    }
}
export function SolidArea(props: {
    children?: React.ReactNode,
    block: Block,
    prop?: string,
    style?: CSSProperties,
    isHtml?: boolean,
    line?: boolean
}) {
    var ps = {
        ref: (e) => props.block.elementAppear({
            el: e,
            prop: props.prop,
            appear: BlockAppear.solid,
        }),
        style: props.style
    };
    var editProps = {
        contentEditable: true,
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
    }
    if (props.line) return <span className='shy-appear-solid'  {...ps} >
        {props.children}
        {props.block.isCanEdit(props.prop) && <span className='shy-appear-solid-cursor' suppressContentEditableWarning {...editProps}></span>}
    </span>
    return <div className='shy-appear-solid'  {...ps} >
        {props.children}
        {props.block.isCanEdit(props.prop) && <span className='shy-appear-solid-cursor' suppressContentEditableWarning {...editProps}></span>}
    </div>
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

