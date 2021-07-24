import React from "react";
import ReactDOM from "react-dom";
let maps = new Map<typeof React.Component, React.Component>();
export async function Singleton<T extends React.Component>(CP: typeof React.Component) {
    return new Promise((resolve: (ins: T) => void, reject) => {
        if (maps.has(CP)) return resolve(maps.get(CP) as T)
        var ele = document.createElement('div');
        document.body.appendChild(ele);
        ReactDOM.render(<CP ref={e => {
            maps.set(CP, e);
            resolve(e as T);
        }} />, ele);
    })
}