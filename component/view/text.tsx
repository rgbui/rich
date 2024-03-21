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
    align?: 'left' | 'right'
}) {
    var c = util.covertToArray(props.className);
    if (props.align == 'left') {
        return <a
            className={"padding-w-3 remark f-12 cursor item-hover round l-20 flex flex-inline " + (c.join(" "))}
            target="_blank"
            href={props.url}><Icon size={14} icon={HelpSvg}></Icon><span className="gap-l-3" >{props.text || props.children}</span></a>
    }
    return <a
        className={"padding-w-3 remark f-12 cursor item-hover round l-20 flex flex-inline " + (c.join(" "))}
        target="_blank"
        href={props.url}><span className="gap-r-3">{props.text || props.children}</span><Icon size={14} icon={HelpSvg}></Icon></a>
}

export function HelpTip(props: { overlay: React.ReactNode }) {
    return <Tip overlay={props.overlay}><span className="padding-w-3 remark f-12 cursor"><Icon size={14} icon={HelpSvg}></Icon></span></Tip>
}