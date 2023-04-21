import React, { CSSProperties } from "react";
export function DotNumber(props: {
    count: number,
    arrow?: 'topRight' | 'none'
}) {
    if (props.count > 0) {
        var style: CSSProperties = {
            color: '#fff',
            background: '#ff0000'
        };
        if (typeof props.arrow == 'undefined' || props.arrow == 'topRight') {
            style.top = 0;
            style.right = 0;
            style.position = 'absolute';
            style.transform = 'translate(30%,-30%)';
        }
        else if (props.arrow == 'none') {

        }
        return <div className="size-16 circle f-12 flex-center " style={style}>{props.count}</div>
    }
    else return <></>
}