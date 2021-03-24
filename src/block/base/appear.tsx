import React from 'react';

export function TextArea(props) {
    return <span className='sy-appear-text' dangerouslySetInnerHTML={props.html}></span>
}
export function SolidArea(props) {
    return <div className='sy-appear-solid'>{props.content}</div>
}