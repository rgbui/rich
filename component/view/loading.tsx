import React, { CSSProperties } from "react";
import lg from "../../src/assert/img/loading.gif";
export function Loading(props: { children?: React.ReactNode, style?: CSSProperties }) {
    return <div className='shy-loading' style={props.style || {}}>
        <img src={lg}></img>
        <div className='shy-loading-content'>{props.children}</div>
    </div>
}