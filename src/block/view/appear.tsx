import lodash from 'lodash';
import React, { CSSProperties } from 'react';
import { Block } from '..';
import { BlockAppear } from '../appear';
import { lst } from '../../../i18n/store';

export function TextArea(props: {
    block: Block,
    placeholderEmptyVisible?: boolean,
    placeholderSmallFont?: boolean,
    prop?: string,
    html?: string,
    /**是否为纯文本 */
    plain?: boolean,
    placeholder?: string,
    style?: CSSProperties,
    default?: string,
    isHtml?: boolean,
    isBlock?: boolean,
    canEdit?: boolean,
    className?: string | (string[])
}) {
    var prop = props.prop;
    if (typeof prop == 'undefined') prop = 'content';
    var ps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> = {
        style: props.style || {},
        placeholder: props.placeholder,
        ref: (e) => props.block.elementAppear({
            el: e,
            prop: props.prop,
            appear: BlockAppear.text,
            plain: props.plain,
            defaultValue: props.default
        }),
    };
    var ce = typeof props.canEdit == 'boolean' ? props.canEdit : props.block.isCanEdit();
    if (ce) {
        ps = {
            ref: ps.ref,
            suppressContentEditableWarning: true,
            style: props.style || {},
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
    if (lodash.isUndefined(html) || lodash.isNull(html) || lodash.isNaN(html)) html = ''
    var classList: string[] = ['shy-appear-text'];
    if (props.className) {
        if (Array.isArray(props.className)) classList.push(...props.className)
        else classList.push(props.className)
    }
    if (props.placeholderEmptyVisible) classList.push('shy-text-empy-visible');
    if (props.placeholderSmallFont) classList.push('shy-text-placeholder-small-font');
    if (props.isBlock) {
        ps.style.display = 'block';
    }
    if (props.isBlock) {

        return <div className={classList.join(" ")} {...(ps as any)} dangerouslySetInnerHTML={{ __html: html }} ></div>
    }
    else {
        return <span className={classList.join(" ")} {...ps} dangerouslySetInnerHTML={{ __html: html }} ></span>
    }
}

export function SolidArea(props: {
    children?: React.ReactNode,
    block: Block,
    prop?: string,
    style?: CSSProperties,
    isHtml?: boolean
}) {
    var ps = {
        ref: (e) => props.block.elementAppear({
            el: e,
            prop: props.prop,
            appear: BlockAppear.solid,
            hasGap: false
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
   
    return <span className='shy-appear-solid'  {...ps} >{props.block.isCanEdit() && <span className='shy-appear-solid-cursor' style={{ width: 1 }} suppressContentEditableWarning {...editProps}></span>}
        <span className='shy-appear-solid-content flex-center flex-inline'>{props.children}</span>
        {props.block.isCanEdit() && <span className='shy-appear-solid-cursor' style={{ width: 1 }} suppressContentEditableWarning {...editProps}></span>
        }</span>
}

export function ChildsArea(props: { childs: Block[] }) {
    if (!Array.isArray(props?.childs)) return <></>
    return <>{props.childs.map(x => {
        if (!x) console.trace(x);
        if (!x.viewComponent) console.error(x);
        return <x.viewComponent key={x.id} block={x}></x.viewComponent>
    })}</>
}

export function TextLineChilds(props: {
    className?: string | string[],
    childs: Block[],
    rf?: (e: HTMLElement) => void,
    style?: CSSProperties
}) {
    var ps = { ref: props.rf, style: props.style }
    return <div className='shy-appear-texts'  {...ps} >{props.childs.map(x => {
        if (!x) console.trace(x);
        if (!x.viewComponent) console.error(x);
        return <x.viewComponent key={x.id} block={x}></x.viewComponent>
    })}</div>
}

export function TextSpanArea(props: { block: Block, isBlock?: boolean, className?: string | string[], placeholderEmptyVisible?: boolean, prop?: string, placeholder?: string }) {
    var isAi = props.block.page.ws?.aiConfig?.disabled == true ? false : true;
    if (props.block.childs.length > 0)
        return <TextLineChilds className={props.className} childs={props.block.childs}></TextLineChilds>
    else
        return <TextArea className={props.className} isBlock={props.isBlock} placeholderEmptyVisible={props.placeholderEmptyVisible} block={props.block} prop={props.prop || 'content'} placeholder={props.placeholder || (!isAi ? lst('输入文本') : lst('空格唤起AI或选择'))}></TextArea>
}

