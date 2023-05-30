import lodash from 'lodash';
import React, { CSSProperties } from 'react';
import { Block } from '..';
import { BlockAppear } from '../appear';
export function TextArea(props: {
    block: Block,
    placeholderEmptyVisible?: boolean,
    prop?: string,
    html?: string,
    /**是否为纯文本 */
    plain?: boolean,
    placeholder?: string,
    style?: CSSProperties,
    default?: string,
    isHtml?: boolean,
    isBlock?: boolean,
    className?: string | (string[])
}) {
    var prop = props.prop;
    if (typeof prop == 'undefined') prop = 'content';
    var ps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> = {
        style: props.style,
        placeholder: props.placeholder
    };
    if (props.block.isCanEdit()) {
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
    var classList: string[] = ['shy-appear-text'];
    if (props.className) {
        if (Array.isArray(props.className)) classList.push(...props.className)
        else classList.push(props.className)
    }
    if (props.placeholderEmptyVisible) classList.push('shy-text-empy-visible');
    if (props.isBlock) {
        if (props.isHtml) return <div className={classList.join(" ")} dangerouslySetInnerHTML={{ __html: html }} {...(ps as any)}></div>
        return <div className={classList.join(" ")} {...(ps as any)}>{html}</div>
    }
    else {
        if (props.isHtml) return <span className={classList.join(" ")} dangerouslySetInnerHTML={{ __html: html }} {...ps}></span>
        return <span className={classList.join(" ")} {...ps}>{html}</span>
    }
}

export function SolidArea(props: {
    children?: React.ReactNode,
    block: Block,
    prop?: string,
    style?: CSSProperties,
    /**
     * 表示行内块 是否有间隙
     * 意味着光标的移动不是在相邻的两个字符之间，而是在两个块之间
     */
    gap?: boolean,
    isHtml?: boolean,
    line?: boolean
}) {
    var ps = {
        ref: (e) => props.block.elementAppear({
            el: e,
            prop: props.prop,
            appear: BlockAppear.solid,
            hasGap: props.gap || false
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
    var line = typeof props.line == 'undefined' ? props.block.isLine : props.line;
    if (line) return <span className='shy-appear-solid'  {...ps} >
        {props.block.isCanEdit() && <span className='shy-appear-solid-cursor' suppressContentEditableWarning {...editProps}></span>}
        <span className='shy-appear-solid-content'>{props.children}</span>
        {props.block.isCanEdit() && <span className='shy-appear-solid-cursor' suppressContentEditableWarning {...editProps}></span>}
    </span>
    return <div className='shy-appear-solid flex'  {...ps} >
        {props.block.isCanEdit() && <span className='shy-appear-solid-cursor flex-fixed' suppressContentEditableWarning {...editProps}></span>}
        <div className='shy-appear-solid-content flex-auto'>{props.children}</div>
        {props.block.isCanEdit() && <span className='shy-appear-solid-cursor flex-fixed' suppressContentEditableWarning {...editProps}></span>}
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

export function TextSpanArea(props: { block: Block, placeholderEmptyVisible?: boolean, prop?: string, placeholder?: string }) {
    if (props.block.childs.length > 0)
        return <TextLineChilds childs={props.block.childs}></TextLineChilds>
    else
        return <TextArea placeholderEmptyVisible={props.placeholderEmptyVisible} block={props.block} prop={props.prop || 'content'} placeholder={props.placeholder || '键入文字或"/"选择'}></TextArea>
}

