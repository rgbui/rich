import React, { CSSProperties } from "react";
import { ComponentSize } from "./declare";
import { HelpSvg } from "../svgs";
import { Icon } from "./icon";
export function Remark(props: { style?: CSSProperties, size?: ComponentSize, children: React.ReactNode }) {
    return <div style={(props.style || {})} className={'remark' + (props.size && props.size == 'middle' ? " f-14" : " f-12")}>{props.children}</div>
}

export function ErrorText(props: { children: React.ReactNode }) {
    return <span className='error'>{props.children}</span>
}

export function HelpText(props: { text: string, url: string }) {
    return <a className="remark f-14 cursor" target="_blank" href={props.url}>
        <span className="flex flex-inline"><Icon size={16} icon={HelpSvg}></Icon>
            <span className="gap-l-5">{props.text}</span></span>
    </a>
}