import React, { CSSProperties } from "react";
import { ComponentSize } from "./declare";
export function Remark(props: { style?: CSSProperties, size?: ComponentSize, children: React.ReactNode }) {
    return <div style={(props.style || {})} className={'shy-remark' + (props.size ? " shy-remark-" + props.size : "")}>{props.children}</div>
}

export function ErrorText(props: { children: React.ReactNode }) {
    return <span className='shy-text-error'>{props.children}</span>
}