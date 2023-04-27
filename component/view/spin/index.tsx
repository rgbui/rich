import React from "react";
import "./style.less";

function getCircle(size?: 24 | 16) {
    return <div className={"size-" + (size) + " relative"}>
        <i className={`size-${size == 24 ? 8 : 4}` + " circle pos bg-primary"} style={{ top: 0, left: 0 }}></i>
        <i className={`size-${size == 24 ? 8 : 4}` + " circle pos bg-primary op-8"} style={{ top: 0, right: 0 }}></i>
        <i className={`size-${size == 24 ? 8 : 4}` + " circle pos bg-primary op-5"} style={{ bottom: 0, right: 0 }}></i>
        <i className={`size-${size == 24 ? 8 : 4}` + " circle pos bg-primary op-3"} style={{ bottom: 0, left: 0 }}></i>
    </div>
}

export function Spin(props: { block?: boolean, size?: 24 | 16, children?: React.ReactNode }) {
    var ov = props.children;
    var size = props.size || 16;
    if (!ov) ov = getCircle(size);
    var div = <div className="shy-spin-circle flex-center flex-inline" style={{ width: size * 1.5, height: size * 1.5 }}>
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

