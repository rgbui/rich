import React, { CSSProperties } from "react";
import { ComponentSize } from "./declare";
import { HelpSvg } from "../svgs";
import { Icon } from "./icon";
import { util } from "../../util/util";
import { Tip } from "./tooltip/tip";

export function Remark(props: {
    style?: CSSProperties,
    size?: ComponentSize,
    children: React.ReactNode
}) {
    return <div style={(props.style || {})} className={'remark' + (props.size && props.size == 'middle' ? " f-14" : " f-12")}>{props.children}</div>
}

export function ErrorText(props: { children: React.ReactNode }) {
    return <span className='error'>{props.children}</span>
}

export function HelpText(props: {
    text?: string,
    children?: React.ReactNode,
    url: string,
    className?: string | (string[]),
    align?: 'left' | 'right',
    block?: boolean,
    onMouseDown?: (event: React.MouseEvent) => void,
}) {

    var cs = util.covertToArray(props.className);
    var pc = props.text || props.children;
    if (pc) { if (!cs.some(s => s.startsWith('padding-w'))) cs.push('padding-w-3') }
    else cs.push('gap-w-3')
    var pa = props.align || 'left';
    if (pa) {
        return <a
            onMouseDown={e => props.onMouseDown && props.onMouseDown(e)}
            style={{ display: props.block ? 'flex' : 'inline-flex' }}
            className={"remark f-12 cursor item-hover round l-20 flex flex-inline " + (cs.join(" "))}
            target="_blank"
            href={props.url}><Icon size={14} icon={HelpSvg}></Icon>{pc && <span className="gap-l-1" >{pc}</span>}</a>
    }
    return <a
        onMouseDown={e => props.onMouseDown && props.onMouseDown(e)}
        style={{ display: props.block ? 'flex' : 'inline-flex' }}
        className={"remark f-12 cursor item-hover round l-20 flex flex-inline " + (cs.join(" "))}
        target="_blank"
        href={props.url}>{pc && <span className="gap-r-1">{pc}</span>}<Icon size={14} icon={HelpSvg}></Icon></a>
}

export function HelpTip(props: { overlay: React.ReactNode }) {
    return <Tip overlay={props.overlay}><span className="padding-w-3 remark f-12 cursor"><Icon size={14} icon={HelpSvg}></Icon></span></Tip>
}