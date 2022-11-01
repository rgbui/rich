import React from "react";
import "./style.less";

function getCircle() {
    return <div className="size-24 relative">
        <i className="circle size-8 pos bg-primary" style={{ top: 0, left: 0 }}></i>
        <i className="circle size-8 pos bg-primary op-8" style={{ top: 0, right: 0 }}></i>
        <i className="circle size-8 pos bg-primary op-5" style={{ bottom: 0, right: 0 }}></i>
        <i className="circle size-8 pos bg-primary op-3" style={{ bottom: 0, left: 0 }}></i>
    </div>
}

export function Spin(props: { block?: boolean, children?: React.ReactNode }) {
    var ov = props.children;
    if (!ov) ov = getCircle();
    var div = <div className="shy-spin-circle flex-center flex-inline" style={{ width: 24 * 1.5, height: 24 * 1.5 }}>
        {ov}
    </div>;
    if (props.block) return <div className="flex-center gap-h-20">{div}</div>
    return div;
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

