import React from "react";
export function Select(props: {
    disabled: boolean,
    value: any,
    options: { text: string, value: any }[],
    onChange: (value: any) => void
}) {
    let [toggle, setToggle] = React.useState(false);
    function click(item) {
        props.onChange(item.value)
    }
    return <div className='sy-select'>
        <div className='sy-select-selection' onClick={e => props.disabled ? undefined : (setToggle(!toggle))}><input defaultValue={props.options.find(g => g.value == props.value)?.text} /></div>
        <div className='sy-select-drop'>
            {props.options.map((op, index) => {
                return <a key={index} className={props.value == op.value ? "hover" : ""} onClick={e => click(op)}><span>{op.text}</span></a>
            })}
        </div>
    </div>
}