import { BaseBlock } from "./base";

/***
 * https://zhuanlan.zhihu.com/p/26559530
 */
export function observable(target: BaseBlock, key: string): any {
    return {
        enumerable: true,
        configurable: true,
        get() {
            return this['__' + key];
        },
        set(value) {
            var oldValue = this['__' + key];
            this['__' + key] = value;
            this.watch(key, value, oldValue);
        }
    }
}

