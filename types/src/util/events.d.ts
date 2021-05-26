export declare type F = (...args: any[]) => any;
export declare class Events<T = string> {
    private __events;
    on(name: T[] | T | Record<string, F>, fn?: F): this;
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
    only(name: T | Record<string, F>, fn?: F): this;
    once(name: T | Record<string, F>, fn?: F): void;
    off(name: T | F, fn?: F): void;
    emit(name: T, ...args: any[]): any;
    has(name: T | F): boolean;
    private __data;
    /****
     *
     * 如果value为null，表示清理key
     */
    store(key: string | Record<string, any>, value?: any): any;
}
