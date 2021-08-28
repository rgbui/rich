
export interface Mix {
    __inherits: any[];
    /**
     * 实始化分布类对象
     * new all class inherits
     */
    __init_mixs(): void;
}



export function Mix(Mix, ...mixins) {
    if (!Array.isArray(Mix.prototype.__inherits)) {
        Mix.prototype.__inherits = [];
        Mix.prototype.__init_mixs = function () {
            Mix.prototype.__inherits.each(cla => {
                var ins = new cla();
                Object.assign(this, ins);
            })
        }
    }
    function copyProperties(target, source) {
        for (let key of Reflect.ownKeys(source)) {
            if (key !== "constructor"
                && key !== "prototype"
                && key !== "name"
            ) {
                let desc = Object.getOwnPropertyDescriptor(source, key);
                Object.defineProperty(target, key, desc);
            }
        }
    }
    for (let mixin of mixins) {
        Mix.prototype.__inherits.push(mixin);
        copyProperties(Mix, mixin);
        copyProperties(Mix.prototype, mixin.prototype);
    }
}