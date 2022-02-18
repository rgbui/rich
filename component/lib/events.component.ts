import React from "react";
export type F = (...args: any[]) => any;
/**
 * 最大相同事件绑定提示数，
 * 如果相同name发现绑定次数据超过一定数量，可以认为出现了bug，
 * 在某些事件的绑定上，有重复绑定的行为，so这里加个提示
 */
const maxSameEventBinds = 5;
/**
 * 事件组件，支持自定义react组件，同时提供事件订阅机制，
 * 这在单例组件中非常有用。
 */
export class EventsComponent<G = {}, T = string> extends React.Component<G>{
    constructor(props: G) {
        super(props);
    }
    private __events: { name: T, fn?: F, once?: boolean }[];
    on(name: T[] | T | Record<string, F>, fn?: F) {
        if (!Array.isArray(this.__events)) this.__events = [];
        if ((typeof name == 'string' || typeof name == 'number') && typeof fn == 'function') {
            this.__events.push({ name, fn });
            if (this.__events.sum(g => g.name == name ? 1 : 0) > maxSameEventBinds) {
                console.warn('shy eventscomponent overflow the same event name:' + name);
            }
        }
        else if (Array.isArray(name)) {
            name.forEach(n => this.on(n, fn));
        }
        else if (typeof name == 'object')
            for (var n in name as any) this.on(n as any, name[n]);
        return this;
    }
    /***
     * 
     * 这个并不是一次执行完后，删除事件，
     * 这个表示绑定的事件name会替换同名的name，确保绑定的事件的唯一性
     * 不用传统的once执行一次就删除事件，
     * 原因如下
     * 1.绑定的事件内部有异步事件，那么在执行后，删除事件，会导致里面的异步不执行，这很蛋疼
     * 2.绑定的事件不一定会触发（就是被消耗掉），这意味着如果多次绑定同名事件，会导致多次触发
     * 
     */
    only(name: T | Record<string, F>, fn?: F) {
        if (!Array.isArray(this.__events)) this.__events = [];
        if (typeof name == 'object') { for (var n in name as any) this.only(n as any, name[n]) }
        else {
            this.__events.removeAll(x => x.name == name);
            this.__events.push({ name, fn });
        }
        return this;
    }
    once(name: T | Record<string, F>, fn?: F) {
        if (!Array.isArray(this.__events)) this.__events = [];
        if (typeof name == 'object') { for (var n in name as any) this.once(n as any, name[n]) }
        else {

            this.__events.push({ name, fn, once: true });
        }
    }
    off(name: T | F, fn?: F) {
        if (!Array.isArray(this.__events)) this.__events = [];
        if (typeof name == 'function') this.__events.removeAll(x => x.fn == name);
        else if (typeof fn == 'function' && (typeof name == 'string' || typeof name == 'number')) this.__events.removeAll(x => x.name == name && x.fn == fn);
        else if ((typeof name == 'string' || typeof name == 'number') && typeof fn == 'undefined') this.__events.removeAll(x => x.name == name);
    }
    emit(name: T, ...args: any[]) {
        if (!Array.isArray(this.__events)) this.__events = [];
        var rs = this.__events.findAll(x => x.name == name);
        if (rs.length == 0) return undefined;
        var gs: any[] = [];
        for (let i = 0; i < rs.length; i++) {
            var r = rs[i];
            if (typeof r.fn == 'function') {
                try {
                    var result = r.fn.apply(this, args);
                    gs.push(result);
                }
                catch (ex) {
                    console.error('happend error in emit', ex);
                    gs.push(undefined);
                }
            }
            else gs.push(undefined);
        }
        if (gs.length == 1) return gs[0]
        else return gs;
    }
    has(name: T | F): boolean {
        if (!Array.isArray(this.__events)) this.__events = [];
        if ((typeof name == 'string' || typeof name == 'number')) return this.__events.exists(x => x.name == name);
        else if (typeof name == 'function') return this.__events.exists(x => x.fn == name);
        else return false;
    }
    syncForceUpdate() {
        return new Promise((resolve, reject) => {
            this.forceUpdate(() => {
                resolve(true);
            })
        })
    }
}





