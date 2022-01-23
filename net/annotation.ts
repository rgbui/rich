import { channelService, MethodType } from "./service";

export function post(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { method:MethodType.post, url });
    }
}
export function act(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { method: MethodType.act, url });
    }
}
export function get(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { method: MethodType.get, url });
    }
}

export function del(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { method: MethodType.del, url });
    }
}
export function put(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { method: MethodType.put, url });
    }
}

export function query(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { method: MethodType.query, url });
    }
}
export function air(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { method: MethodType.air, url });
    }
}
export function passive(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { method: MethodType.passive, url });
    }
}