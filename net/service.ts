import { channel } from "./channel";




export enum MethodType {
    get,
    post,
    patch,
    query,
    act,
    del,
    put,
    air,
    passive
}




export class ServiceMeta {
    url: string;
    type: MethodType;
    method: string;
    target: FunctionConstructor;
    static TargetMapInstance = new Map();
    get instance() {
        var r = ServiceMeta.TargetMapInstance.get((this.target as any));
        if (r) return r;
        var instance = new (this.target as any).constructor() as any;
        ServiceMeta.TargetMapInstance.set((this.target as any), instance);
        return instance;
    }
}

class ChannelService {
    serviceMetas: ServiceMeta[] = [];
    registerMeta(target: FunctionConstructor, propKey: string, data: Record<string, any>) {
        var sm = this.serviceMetas.find(g => g.target === target && g.method == propKey);
        if (sm) {
            Object.assign(sm, data);
        }
        else {
            sm = new ServiceMeta();
            sm.target = target;
            sm.method = propKey;
            Object.assign(sm, data);
            this.serviceMetas.push(sm);
        }
    }
    excute(type: MethodType, url: string, args: Record<string, any>) {
        var sms = this.serviceMetas.filter(g => g.url == url && type == g.type);
        if (sms.length > 0) {
            var sm = sms.first();
            if (sms.length > 1) {
                /**
                 * 这里一般只会有一个service，如果有多个是有错误的
                 */
                channel.fire('/log', { type: 'error', message: new Error('有多个service') })
            }
            try {
                return sm.instance[sm.method].apply(sm.instance, [args]);
            }
            catch (ex) {
                console.error('push', ex);
                channel.fire('/log', { type: 'error', message: ex });
            }
        }
        else {
            if(type){
                console.warn('not found url:'+url);
            }
            //没有找到service ,默认触发fire
            return channel.fire(url as any, args);
        }
    }
    consumes: { url: string, date?: Date, once?: boolean, handle: (args: Record<string, any>) => any }[] = [];
    async fire(url: string, args: Record<string, any>) {
        let es = this.consumes.filter(ev => ev.url == url);
        var rs: any[] = [];
        var removeE = [];
        for (let e of es) {
            if (e.once == true) removeE.push(e);
            var r;
            try {
                r = e.handle(args);
                if (r instanceof Promise) {
                    var g = await r;
                    rs.push(g);
                }
                else rs.push(r);
            }
            catch (ex) {
                console.error('fire', ex);
                this.fire('/log', { type: "error", message: ex })
            }
        }
        this.consumes.removeAll(e => removeE.some(r => r === e));
        if (es.length == 1) return rs[0]
        else return rs;
    }
    /**
     * 一般由websocket监听是否有消息推送过来
     * 正常会直接通过fire消费掉了，
     * 但有时候需要对推送过来的消息进行service处理，处理好，再通过fire消费。
     * @param url 
     * @param args 
     * @returns 
     */
    async passive(url: string, args: Record<string, any>) {
        var sms = this.serviceMetas.filter(g => g.url == url && g.type == MethodType.passive);
        if (sms.length > 0) {
            var sm = sms.first();
            if (sms.length > 1) {
                /**
                 * 这里一般只会有一个service，如果有多个是有错误的
                 */

                channel.fire('/log', { type: 'warn', message: new Error('有多个service') });
            }
            try {
                return await sm.instance[sm.method].apply(sm.instance, [args]);
            }
            catch (ex) {
                console.error('passive', ex);
                channel.fire('/log', { type: 'error', message: ex });
            }
        }
        else {
            //没有找到service ,默认触发fire
            return channel.fire(url as any, args);
        }
    }
}

export var channelService = new ChannelService();


