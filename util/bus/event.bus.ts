import { Directive } from "./directive";
/***
 * 内部消息订阅通知触发器
 * 
 */
class EventBus {
    private _events: { directive: Directive, action: (...args: any[]) => any }[] = [];
    on(directive: Directive, action: (...args: any[]) => any) {
        this._events.push({ directive, action });
    }
    fire(directive: Directive, ...args: any[]) {
        let es = this._events.filter(ev => ev.directive == directive);
        var rs: any[] = [];
        for (let e of es) {
            var r = e.action(...args);
            rs.push(r);
        }
        if (es.length == 1) return rs[0]
        else return rs;
    }
    async fireAsync(directive: Directive, ...args: any[]) {
        let es = this._events.filter(ev => ev.directive == directive);
        var rs: any[] = [];
        for (let e of es) {
            var r = e.action(...args);
            if (r instanceof Promise) {
                var g = await r;
                rs.push(g);
            }
        }
        if (es.length == 1) return rs[0]
        else return rs;
    }
}
/**
 * 订阅通知活动事件申明
 */
interface EventBus {
    on(directive: Directive.uploadFile, handler: (file: File, uploadProgress?: (event: ProgressEvent) => void) => Promise<{ ok: boolean, data: { url: string } }>): void;
    fireAsync(directive: Directive.uploadFile, file: File, uploadProgress?: (event: ProgressEvent) => void): Promise<{ ok: boolean, data: { url: string } }>;
}
export let bus = new EventBus()