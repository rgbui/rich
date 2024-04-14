import React, { LazyExoticComponent, Suspense } from "react";
import ReactDOM from "react-dom";
import { assyDiv } from "../types";
import { Spin } from "../view/spin";
let maps = new Map<typeof React.Component | string, React.Component>();

/**
 * 对组件进行单例化，
 * 不同的nickName可以创建多个实例
 * @param CP 
 * @param nickName 
 * @returns 
 */
export async function Singleton<T extends React.Component>(CP: { new(...args: any[]): T }, nickName?: string) {
    return new Promise((resolve: (ins: T) => void, reject) => {
        if (maps.has(nickName)) return resolve(maps.get(nickName) as T)
        if (maps.has(CP) && !nickName) return resolve(maps.get(CP) as T)
        ReactDOM.render(<CP ref={e => {
            if (nickName) maps.set(nickName, e)
            else maps.set(CP, e);
            resolve(e as T);
        }} />, assyDiv());
    })
}

var ms = new Map();
export async function LazySingleton<T extends React.Component>(CP: React.LazyExoticComponent<(new (...args: any[]) => T)>, nickName?: string) {
    return new Promise((resolve: (ins: T) => void, reject) => {
        if (ms.has(nickName)) return resolve(ms.get(nickName) as T)
        if (ms.has(CP) && !nickName) return resolve(ms.get(CP) as T)
        var GP = CP as any;
        ReactDOM.render(<Suspense fallback={<div><Spin block></Spin></div>}><GP ref={e => {
            if (nickName) ms.set(nickName, e as any)
            else ms.set(CP, e as any);
            resolve(e as T);
        }} /></Suspense>, assyDiv());
    })
}