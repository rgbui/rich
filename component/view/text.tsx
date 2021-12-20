import React from "react";
export function Remark(props: { children: React.ReactNode }) {
    return <div className='shy-remark'>{props.children}</div>
}

export function ErrorText(props: { children: React.ReactNode }) {
    return <span className='shy-text-error'>{props.children}</span>
}