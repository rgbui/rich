import React from "react";
export function FieldView(props: {
    text: string, children?: JSX.Element | string | React.ReactNode
    require?: boolean,
    remark?: string,
    error?: string
}) {
    return <div className='sy-form-field'>
        <div className="sy-form-field-label">{props.require && <em>*</em>}<label>{props.text}</label></div>
        <div className="sy-form-field-control">{props.children}</div>
        {props.remark && <div className="sy-form-field-remark">{props.remark}</div>}
        {props.error && <div className="sy-form-field-error">{props.error}</div>}
    </div>
}