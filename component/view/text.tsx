import React, { CSSProperties } from "react";
import { ComponentSize } from "./declare";
export function Remark(props: { style?: CSSProperties, size?: ComponentSize, children: React.ReactNode }) {
    return <div style={(props.style || {})} className={'remark' + (props.size&&props.size=='middle' ? " f-14":" f-12")}>{props.children}</div>
}

export function ErrorText(props: { children: React.ReactNode }) {
    return <span className='error'>{props.children}</span>
}