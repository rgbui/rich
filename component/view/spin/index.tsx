import React, { CSSProperties } from "react";
import { util } from "../../../util/util";
import "./style.less";

// function getCircle(size?: 24 | 16) {
//     return <div className={"size-" + (size) + " relative"}>
//         <i className={`size-${size == 24 ? 8 : 4}` + " circle pos bg-primary"} style={{ top: 0, left: 0 }}></i>
//         <i className={`size-${size == 24 ? 8 : 4}` + " circle pos bg-primary op-8"} style={{ top: 0, right: 0 }}></i>
//         <i className={`size-${size == 24 ? 8 : 4}` + " circle pos bg-primary op-5"} style={{ bottom: 0, right: 0 }}></i>
//         <i className={`size-${size == 24 ? 8 : 4}` + " circle pos bg-primary op-3"} style={{ bottom: 0, left: 0 }}></i>
//     </div>
// }

export function Spin(props: { gap?: number, block?: boolean, size?: 24 | 16, children?: React.ReactNode }) {
    var ov = props.children;
    var size = props.size || 16;
    var gap = props.gap || 10;
    if (props.block) return <div style={{
        marginTop: gap,
        marginBottom: gap
    }} className="flex-center ">
        {Loading4(size)}
    </div>
    return Loading4(size);
}

export function SpinBox(props: {
    children?: React.ReactNode,
    spin?: boolean,
    mask?: boolean
}) {
    return <div className="relative">
        {props.children}
        {props.mask && props.spin && <div className="pos-full" style={{ background: 'rgba(0,0,0,.1)', opacity: .4 }}></div>}
        {props.spin && <div className="pos-center">{Loading4(24)}</div>}
    </div>
}


export function Loading1() {
    return <div className="loading1">
        <div></div>
        <div></div>
        <div></div>
    </div>
}

export function Loading2(props?: { size?: number, remark?: boolean, className?: string | (string[]) }) {
    var size = props?.size || 32;
    var classList: string[] = ['loading2'];
    if (Array.isArray(props?.className)) classList = classList.concat(props?.className);
    else if (props.className) classList.push(props.className);
    var style: CSSProperties = {
        width: size,
        height: size
    }
    if (props.remark) {
        classList.push('remark-im');
    }
    return <div className={classList.join(" ")} style={style}>
        <div></div>
        <div></div>
    </div>
}

export function Loading3() {
    return <div className="loading3">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>

}

export function SK(props: { children?: React.ReactNode, style?: CSSProperties, className?: (string[]) | string }) {
    var classList: string[] = ['sketelon'];
    var style: CSSProperties = props.style || {};
    if (Array.isArray(props.className)) classList = classList.concat(props.className);
    else if (props.className) classList.push(props.className);
    return <div style={style} className={classList.join(" ")}>{props.children}</div>
}

export class Ring extends React.Component<{
    lineWidth: number,
    color?: string,
    hoverColor?: string,
    size?: number,
    value?: number,
    percent?: number,
    className?: string,
}> {
    render() {
        var lineWidth = this.props.lineWidth || 4;
        var size = this.props.size || 30;
        var color = this.props.color || 'rgba(199, 198, 196, 0.5)';
        var hoverColor = this.props.hoverColor || 'red';
        var value = this.props.value || 0;
        var percent = this.props.percent || 100;
        var r = (size - lineWidth) / 2;
        var c = size / 2;
        var d = lineWidth;
        var cc = r * 2 * Math.PI;
        var off = ((percent - Math.min(percent, value)) / percent) * cc;
        var cls = util.covertToArray(this.props.className);
        return <svg className={cls.join(" ")} viewBox={`0 0 ${size} ${size}`} color="transparent" style={{ "width": size, "height": size, "transform": "rotate(-90deg)", "transformOrigin": "50% 50%" }}>
            <circle r={r} cx={c} cy={c} strokeWidth={d} stroke={color} strokeLinecap="round" fill="transparent"></circle>
            <circle r={r} cx={c} cy={c} strokeWidth={d} stroke={hoverColor} strokeLinecap="round" strokeDasharray={cc} strokeDashoffset={off} fill="transparent"></circle>
        </svg>
    }
}

export function Loading4(size = 32) {
    return <svg
        style={{
            boxSizing: 'content-box',
            color: 'var(--text-color)'
        }}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none" className="anim-rotate">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" vectorEffect="non-scaling-stroke" fill="none"></circle>
        <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke"></path>
    </svg>
}