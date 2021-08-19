import { LinkPage } from "../../extensions/at/declare";
import { IconArguments } from "../../extensions/icon/declare";
import { GalleryType, OuterPic } from "../../extensions/image/declare";
import { User } from "../../src/types/user";
import { Directive } from "./directive";

/**
 * 最大相同事件绑定提示数，
 * 如果相同name发现绑定次数据超过一定数量，可以认为出现了bug，
 * 在某些事件的绑定上，有重复绑定的行为，so这里加个提示
 */
const maxSameEventBinds = 10;

/***
 * 内部消息订阅通知触发器
 * 
 */
class EventBus {
    private _events: { directive: Directive, action: (...args: any[]) => any }[] = [];
    on(directive: Directive, action: (...args: any[]) => any) {
        this._events.push({ directive, action });
        var sum = this._events.sum(g => g.directive == directive ? 1 : 0);
        if (sum>maxSameEventBinds)
        {
            console.warn(`event bus the same name ${Directive[directive]} events total overflow maxSameEventBinds`)
        }
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
    off(directive: Directive, fn: (...ars: any) => any) {
        this._events.removeAll(g => g.directive == directive && g.action == fn);
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

    on(directive: Directive.UpdatePageItem, fn: (id: string, pageInfo: { text: string, icon?: IconArguments }) => Promise<LinkPage>): void;
    fireAsync(directive: Directive.UpdatePageItem, id: string, pageInfo: { text: string, icon?: IconArguments }): Promise<LinkPage>;


    on(directive: Directive.OpenPageItem, fn: (item: any) => void): void;
    fire(directive: Directive.OpenPageItem, item: any): void;

    on(directive: Directive.UpdateUser, fn: (user: Record<string, any>) => Promise<void>): void;
    fireAsync(directive: Directive.UpdateUser, user: Record<string, any>): Promise<void>;


}
export let messageChannel = new EventBus()