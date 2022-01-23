import { channelService, MethodType } from "./service";


/***
 * 数据的通信有几下几种情况
 * 1. 监听消息（可以是内部事件触发的、它人推送过来的，系统推送过来的）
 * 2. 主动发送消息
 * 3. 主动发送消息，并等待返回结果（发送后，等待得到结果）
 * 4. 主动发送消息，并监听消息返回结果（发送后，不会立马得到结果，后续有可能推送过来一次）
 * 5. 主动发送消息，并监听消息返回结果（发送后，不会立马得到结果，后续有可能推送过来，会有多次的情况）
 * 
 * 消息分为内部传递、服务器传递、shareWorker(浏览器多个页面共享传递数据)
 * 例如A推送消息-
 * 由服务处理推送的消息，
 * 然后服务可以直接返回相关的消息，也可以广播出去。
 * 
 */
export class Channel {
    private constructor() { }
    private static _ch: Channel;
    static get channel() {
        if (typeof this._ch == 'undefined') this._ch = new Channel();
        return this._ch;
    }
    async put(url: string, args: Record<string, any>) {
        return channelService.push(MethodType.put, url, args);
    }
    async act(url: string, args: Record<string, any>) {
        return channelService.push(MethodType.act, url, args);
    }
    async get(url: string, args: Record<string, any>) {
        return channelService.push(MethodType.get, url, args);
    }
    async query(url: string, args: Record<string, any>) {
        return channelService.push(MethodType.query, url, args);
    }
    async post(url: string, args: Record<string, any>) {
        return channelService.push(MethodType.post, url, args);
    }
    async del(url: string, args: Record<string, any>) {
        return channelService.push(MethodType.del, url, args);
    }
    async air(url: string, args: Record<string, any>) {
        return channelService.push(MethodType.air, url, args);
    }
    async fire(url: string, args: Record<string, any>) {
        return channelService.fire(url, args);
    }
    off(url: string, handle?: (...args: any) => any) {
        if (handle) channelService.consumes.removeAll(g => g.url == url && g.handle == handle);
        else channelService.consumes.removeAll(g => g.url == url);
    }
    sync(url: string, handle: (args: Record<string, any>) => any) {
        channelService.consumes.push({ url, handle });
    }
    only(url: string, handle: (args: Record<string, any>) => any) {
        channelService.consumes.removeAll(g => g.url == url);
        channelService.consumes.push({ url, handle });
    }
    once(url: string, handle: (args: Record<string, any>) => any) {
        channelService.consumes.push({ url, once: true, handle });
    }
}


export var channel = Channel.channel;


