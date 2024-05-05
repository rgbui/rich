import React, { CSSProperties } from "react";
import { UserStatus } from "../../../types/user";
export function renderAvatorStatusSvgMask() {
    return <svg x="14.5" y="17" width="25" style={{ position: 'absolute', left: -10000 }} height="15" viewBox="0 0 25 15">
        <mask id="user-avator-mask-online"><rect x="7.5" y="5" width="10" height="10" rx="5" ry="5" fill="white"></rect><rect x="12.5" y="10" width="0" height="0" rx="0" ry="0" fill="black"></rect><polygon points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)" style={{ transformOrigin: '13.125px 10px' }} ></polygon><circle fill="black" cx="12.5" cy="10" r="0"></circle></mask>
        <mask id="user-avator-mask-busy"><rect x="7.5" y="5" width="10" height="10"
            rx="5" ry="5" fill="white"></rect><rect x="8.75"
                y="8.75" width="7.5" height="2.5" rx="1.25" ry="1.25" fill="black"></rect><polygon
                    points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)" style={{ transformOrigin: '13.125px 10px' }} ></polygon><circle fill="black" cx="12.5" cy="10" r="0"></circle></mask>
        <mask id="user-avator-mask-hidden"><rect x="7.5" y="5" width="10" height="10" rx="5" ry="5" fill="white"></rect><rect x="10" y="7.5" width="5" height="5" rx="2.5" ry="2.5" fill="black"></rect><polygon points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)"
            style={{ transformOrigin: '13.125px 10px' }} ></polygon><circle fill="black" cx="12.5" cy="10" r="0"></circle>
        </mask>
        <mask id="user-avator-mask-idle">
            <rect x="7.5" y="5" width="10" height="10" rx="5" ry="5" fill="white"></rect>
            <rect x="6.25" y="3.75" width="7.5" height="7.5" rx="3.75" ry="3.75" fill="black"></rect><polygon points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)" style={{ transformOrigin: '13.125px 10px' }}></polygon>
            <circle fill="black" cx="12.5" cy="10" r="0"></circle>
        </mask>
    </svg>
}

export function getAvatorStatusSvg(status: UserStatus, cssStyle?: CSSProperties) {
    var style: React.CSSProperties = {
        width: 25,
        height: 15,
        transform: 'translate(5.5px, -2px)'
    }
    if (cssStyle) {
        Object.assign(style, cssStyle)
    }
    if (status == UserStatus.online) return <div style={style}>
        <svg x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">
            <rect fill="rgb(59, 165, 93)" width="25" height="15" mask="url(#user-avator-mask-online)"></rect>
        </svg>
    </div>

    if (status == UserStatus.busy) return <div style={style}><svg x="14.5" y="17" width="25" height="15"
        viewBox="0 0 25 15">
        <rect fill="rgb(237, 66, 69)" width="25" height="15" mask="url(#user-avator-mask-busy)"></rect>
    </svg>
    </div>

    if (status == UserStatus.hidden) return <div style={style}>
        <svg x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">
            <rect fill="rgb(116, 127, 141)" width="25" height="15" mask="url(#user-avator-mask-hidden)"></rect></svg>
    </div>


    if (status == UserStatus.idle) return <div style={style}>
        <svg x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">
            <rect
                fill="rgb(250, 168, 26)" width="25" height="15"
                mask="url(#user-avator-mask-idle)"></rect>
        </svg>
    </div>

}