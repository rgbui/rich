import { LinkPage } from "../../extensions/at/declare";
import { IconArguments } from "../../extensions/icon/declare";
import { GalleryType, OuterPic } from "../../extensions/image/declare";
import { User } from "../../src/types/user";
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
    only(directive: Directive, action: (...args: any[]) => any) {
        this._events.removeAll(g => g.directive == directive);
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
    has(directive: Directive) {
        return this._events.exists(g => g.directive == directive)
    }
}
/**
 * 订阅通知活动事件申明
 */
interface EventBus {
    on(directive: Directive.UploadFile, handler: (file: File, uploadProgress?: (event: ProgressEvent) => void) => Promise<{ ok: boolean, data: { url: string } }>): void;
    only(directive: Directive.UploadFile, handler: (file: File, uploadProgress?: (event: ProgressEvent) => void) => Promise<{ ok: boolean, data: { url: string } }>): void;
    fireAsync(directive: Directive.UploadFile, file: File, uploadProgress?: (event: ProgressEvent) => void): Promise<{ ok: boolean, data: { url: string } }>;
    on(directive: Directive.GalleryQuery, fn: (type: GalleryType, word: string) => Promise<OuterPic[]>): void;
    only(directive: Directive.GalleryQuery, fn: (type: GalleryType, word: string) => Promise<OuterPic[]>): void;
    fireAsync(directive: Directive.GalleryQuery, type: GalleryType, word: string): Promise<OuterPic[]>;
    on(directive: Directive.UsersQuery, fn: () => Promise<User[]>): void;
    only(directive: Directive.UsersQuery, fn: () => Promise<User[]>): void;
    fireAsync(directive: Directive.UsersQuery): Promise<User[]>;
    on(directive: Directive.PagesQuery, fn: (word: string) => Promise<LinkPage[]>): void;
    only(directive: Directive.PagesQuery, fn: (word: string) => Promise<LinkPage[]>): void;
    fireAsync(directive: Directive.PagesQuery, word: string): Promise<LinkPage[]>;

    on(directive: Directive.CreatePage, fn: (pageInfo: { text: string, icon?: IconArguments }) => Promise<LinkPage>): void;
    only(directive: Directive.CreatePage, fn: (pageInfo: { text: string, icon?: IconArguments }) => Promise<LinkPage>): void;
    fireAsync(directive: Directive.CreatePage, pageInfo: { text: string, icon?: IconArguments }): Promise<LinkPage>;

}
export let richBus = new EventBus()