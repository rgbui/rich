import React from "react";
import "./style.less";

function getCircle() {
    return <div className="size-24">
        <i className="circle size-8 pos bg-primary" style={{ top: 0, left: 0 }}></i>
        <i className="circle size-8 pos bg-primary op-9" style={{ top: 0, right: 0 }}></i>
        <i className="circle size-8 pos bg-primary op-3" style={{ bottom: 0, left: 0 }}></i>
        <i className="circle size-8 pos bg-primary op-6" style={{ bottom: 0, right: 0 }}></i>
    </div>
}

export function Spin(props: { children?: React.ReactNode }) {
    var ov = props.children;
    if (!ov) ov = getCircle();
    return <div className="shy-spin-circle" style={{ display: 'inline-block' }}>
        {ov}
    </div>
}
export function SpinBox(props: {
    children?: React.ReactNode,
    overlay?: React.ReactNode,
    spin?: boolean,
    mask?: boolean
}) {
    var ov = props.overlay;
    if (!ov) ov = getCircle();
    return <div className="relative">
        {props.children}
        {props.mask && <div className="pos-full" style={{ background: 'rgba(0,0,0,.1)', opacity: .4 }}></div>}
        {props.spin && <div className="pos-center"><div className="shy-spin-circle">{ov}</div></div>}
    </div>
}

