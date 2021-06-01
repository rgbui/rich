
import { BlockFactory } from "./block.factory";
export function observable(name?: string) {
    return (target, propetyKey, descriptor) => {
        let oldMethod = descriptor.value
        descriptor.value = function () {
            let result = oldMethod.apply(this, arguments)
            return result
        }
    }
}
export function observableAsync(name?: string) {
    return (target, propetyKey, descriptor) => {
        let oldMethod = descriptor.value
        descriptor.value = async function () {
            var args = Array.from(arguments);
            let result = await oldMethod.apply(this, args)
            return result
        }
    }
}

export function prop() {
    return function (target: any, attr: any) {
        if (!Array.isArray(target.__props)) {
            target.__props = [];
        }
        var rs = target.__props.map(pro => pro);
        target.__props = rs;
        rs.push(attr);
    }
}


export function url(url: string) {
    return (target) => {
        target.prototype.url = url;
        BlockFactory.registerComponent(url, target);
    }
}
export function view(url: string) {
    return (target) => {
        target.prototype.url = url;
        BlockFactory.registerComponentView(url, target);
    }
}

