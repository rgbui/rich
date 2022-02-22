import React from "react";
import ReactDOM from "react-dom";
let maps = new Map<typeof React.Component | string, React.Component>();
export async function Singleton<T extends React.Component>(CP: { new(...args: any[]): T }, nickName?: string) {
    return new Promise((resolve: (ins: T) => void, reject) => {
        if (maps.has(nickName)) return resolve(maps.get(nickName) as T)
        if (maps.has(CP)) return resolve(maps.get(CP) as T)
        var ele = document.createElement('div');
        document.body.appendChild(ele);
        ReactDOM.render(<CP ref={e => {
            if (nickName) maps.set(nickName, e)
            else maps.set(CP, e);
            resolve(e as T);
        }} />, ele);
    })
}