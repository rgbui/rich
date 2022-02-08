import { channelService, MethodType } from "./service";

export function post(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { type:MethodType.post, url });
    }
}
export function patch(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { type:MethodType.post, url });
    }
}
export function act(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { type: MethodType.act, url });
    }
}
export function get(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { type: MethodType.get, url });
    }
}

export function del(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { type: MethodType.del, url });
    }
}
export function put(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { type: MethodType.put, url });
    }
}

export function query(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { type: MethodType.query, url });
    }
}
export function air(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { type: MethodType.air, url });
    }
}
export function passive(url: string) {
    return (target, propKey, descriptor: PropertyDescriptor) => {
        channelService.registerMeta(target, propKey, { type: MethodType.passive, url });
    }
}