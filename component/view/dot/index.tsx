import React from "react";
export function DotNumber(props: { count: number }) {
    if (props.count > 0)
        return <div className="size-16 circle f-12 flex-center " style={{
            color: '#fff',
            background: '#ff0000',
            right: 0,
            top: 0,
            position: 'absolute'
        }}>{props.count}</div>
    else return <></>
}