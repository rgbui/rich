import React from "react";

var num = 0;
function getFileId() {
    return 'shy-file-' + (Date.now()) + "-" + (num++);
}

export function FileView(props: {
    children?: React.ReactNode,
    exts?: string[],
    onChange: (files: File[]) => void
}) {
    var id = getFileId();
    return <div className="relative">
        <label htmlFor={id} style={{ display: 'block' }}>{props.children}</label>
        <input
            id={id}
            onChange={e => {
                var files = Array.from(e.target.files || []);
                props.onChange(files || [])
            }}
            style={{ position: 'absolute', top: -10000, left: -10000 }}
            accept={Array.isArray(props.exts) ? props.exts.join(",") : "*"}
            type='file'
        />
    </div>
}