import { ChannelActMapUrls, ChannelAirMapUrls, ChannelDelMapUrls, ChannelFireMapUrls, ChannelGetMapUrls, ChannelOffMapUrls, ChannelOnceMapUrls, ChannelOnlyMapUrls, ChannelPatchMapUrls, ChannelPostMapUrls, ChannelPutMapUrls, ChannelQueryMapUrls, ChannelSyncMapUrls } from "./declare";
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
class Channel {

    private constructor() { }
    private static _ch: Channel;
    static get channel() {
        if (typeof this._ch == 'undefined') this._ch = new Channel();
        return this._ch;
    }
    put<K extends keyof ChannelPutMapUrls>(url: K, args?: ChannelPutMapUrls[K]['args']): ChannelPutMapUrls[K]['returnType'] {
        return channelService.push(MethodType.put, url, args);
    }
    act<K extends keyof ChannelActMapUrls>(url: K, args?: ChannelActMapUrls[K]['args']): ChannelActMapUrls[K]['returnType'] {
        return channelService.push(MethodType.act, url, args) as any;
    }
    get<K extends keyof ChannelGetMapUrls>(url: K, args?: ChannelGetMapUrls[K]['args']): ChannelGetMapUrls[K]['returnType'] {
        return channelService.push(MethodType.get, url, args);
    }
    query<K extends keyof ChannelQueryMapUrls>(url: K, args?: ChannelQueryMapUrls[K]['args']): ChannelQueryMapUrls[K]['returnType'] {
        return channelService.push(MethodType.query, url, args) as any;
    }
    post<K extends keyof ChannelPostMapUrls>(url: K, args: ChannelPostMapUrls[K]['args']): ChannelPostMapUrls[K]['returnType'] {
        return channelService.push(MethodType.post, url, args);
    }
    patch<K extends keyof ChannelPatchMapUrls>(url: K, args: ChannelPatchMapUrls[K]['args']): ChannelPatchMapUrls[K]['returnType'] {
        return channelService.push(MethodType.patch, url, args);
    }
    del<K extends keyof ChannelDelMapUrls>(url: K, args: ChannelDelMapUrls[K]['args']): ChannelDelMapUrls[K]['returnType'] {
        return channelService.push(MethodType.del, url, args);
    }
    air<K extends keyof ChannelAirMapUrls>(url: K, args: ChannelAirMapUrls[K]['args']): ChannelAirMapUrls[K]['returnType'] {
        return channelService.push(MethodType.air, url, args) as any;
    }
    fire<K extends keyof ChannelFireMapUrls>(url: K, args?: ChannelFireMapUrls[K]['args']): ChannelFireMapUrls[K]['returnType'] {
        return channelService.fire(url, args) as any;
    }
    off<K extends keyof ChannelOffMapUrls>(url: K, handle?: ChannelOffMapUrls[K]['args']) {
        if (handle) channelService.consumes.removeAll(g => g.url == url && g.handle == handle);
        else channelService.consumes.removeAll(g => g.url == url);
    }
    sync<K extends keyof ChannelSyncMapUrls>(url: K, handle: ChannelSyncMapUrls[K]['args']) {
        channelService.consumes.push({ url, handle });
    }
    only<K extends keyof ChannelOnlyMapUrls>(url: string, handle: ChannelOnlyMapUrls[K]['args']) {
        channelService.consumes.removeAll(g => g.url == url);
        channelService.consumes.push({ url, handle });
    }
    once<K extends keyof ChannelOnceMapUrls>(url: string, handle: ChannelOnceMapUrls[K]['args']) {
        channelService.consumes.push({ url, once: true, handle });
    }
}





export var channel = Channel.channel;








