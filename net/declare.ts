
import { Field } from "../blocks/data-grid/schema/field";
import { TableSchema } from "../blocks/data-grid/schema/meta";
import { FieldType } from "../blocks/data-grid/schema/type";
import { LinkPageItem } from "../extensions/at/declare";
import { IconArguments, ResourceArguments } from "../extensions/icon/declare";
import { GalleryType, OuterPic } from "../extensions/image/declare";
import { User } from "../src/types/user";
import { StatusCode } from "./status.code";
import { UserAction } from "../src/history/action";
export type SockResponse<T, U = string> = {
        /**
         * 返回状态码
         */
        code?: StatusCode,
        /**
         * 表示当前的是否处理正常
         * 通常200~300表示正常处理
         * 大于300小于500表示处理不正常，
         * 500 seriver happend error
         * 返回值是用来提醒处理异常原因的
         */
        ok?: boolean,
        data?: T,
        warn?: U
    }
export interface ChannelSyncMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo:LinkPageItem})=>void,returnType:void},
	"/page/open":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void}
}
export interface ChannelOnlyMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo:LinkPageItem})=>void,returnType:void},
	"/page/open":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void}
}
export interface ChannelOnceMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo:LinkPageItem})=>void,returnType:void},
	"/page/open":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void}
}
export interface ChannelOffMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo:LinkPageItem})=>void,returnType:void},
	"/page/open":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void}
}
export interface ChannelFireMapUrls {
    "/log":{args:{type:"error"|"warn"|"info",message:string|Error},returnType:void},
	"/page/update/info":{args:{id: string, pageInfo:LinkPageItem},returnType:void},
	"/page/open":{args:{item:string|{id:string}},returnType:void},
	"/page/notify/toggle":{args:{id: string,visible:boolean},returnType:void},
	"/update/user":{args:{user: Record<string, any>},returnType:void}
}
export interface ChannelDelMapUrls {
    "/datastore/remove":{args:{schemaId:string,dataId:string},returnType:Promise<{ok:boolean,warn:string}>}
}
export interface ChannelPostMapUrls {
    "/phone/sms/code":{args:{phone:string},returnType:Promise<{ok:boolean,warn:string,data:{success:boolean,code?:string}}>},
	"/user/upload/file":{args:{file:File,uploadProgress: (event: ProgressEvent) => void},returnType:Promise<SockResponse<{url:string}>>},
	"/ws/invite/join":{args:{wsId:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/upload/file":{args:{file:File,uploadProgress: (event: ProgressEvent) => void},returnType:Promise<SockResponse<{ url: string }>>},
	"/ws/download/url":{args:{url:string},returnType:Promise<SockResponse<{ url: string }>>}
}
export interface ChannelPatchMapUrls {
    "/datastore/update":{args:{schemaId:string,dataId:string,data:Record<string, any>},returnType:Promise<SockResponse<void>>},
	"/user/patch":{args:{data:Record<string,any>},returnType:Promise<SockResponse<void>>},
	"/ws/sitedomain/patch":{args:{domain:string},returnType:Promise<SockResponse<{success:boolean,overflowDue:boolean}>>},
	"/ws/patch":{args:{wsId?:string,sockId?:string,data:Record<string,any>},returnType:Promise<SockResponse<void>>},
	"/interactive/emoji":{args:{elementUrl:string},returnType:Promise<SockResponse<{count:number}>>}
}
export interface ChannelPutMapUrls {
    "/schema/create":{args:{text:string,url:string,templateId?:string},returnType:Promise<{ ok: boolean, data: { schema:Partial<TableSchema> },warn:string }>},
	"/schema/operate":{args:{operate:{operate?:string,schemaId:string,date?:Date,actions:any[]}},returnType:Promise<SockResponse<{actions:any[]}>>},
	"/datastore/add":{args:{schemaId:string,data:Record<string, any>,pos:{dataId:string,pos:"before"|"after"}},returnType:Promise<{ok:boolean,data:{data:Record<string, any>},warn:string}>},
	"/datastore/batch/add":{args:{schemaId:string,list:any[]},returnType:Promise<{ok:boolean,data:{list:any[]},warn:string}>},
	"/datastore/query/ids":{args:{schemaId:string,ids:string[]},returnType:Promise<{ok:boolean,data:{list:any[]},warn:string}>},
	"/device/sign":{args:any,returnType:Promise<void>},
	"/phone/sign":{args:{phone:string,code:string,inviteCode:string},returnType:Promise<{ok:boolean,warn:string,data:{user:Record<string,any>,guid:string,token:string}}>},
	"/ws/create":{args:{text:string,templateId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/invite/create":{args:any,returnType:Promise<SockResponse<{code:string}>>}
}
export interface ChannelGetMapUrls {
    "/gallery/query":{args:{type: GalleryType, word: string},returnType:Promise<{ok:boolean,data:OuterPic[],warn:string}>},
	"/page/query/info":{args:{id: string},returnType:Promise<SockResponse<LinkPageItem>>},
	"/schema/query":{args:{id:string},returnType:Promise<{ok:boolean,data:{schema:Partial<TableSchema>},warn:string}>},
	"/schema/list":{args:{page?:number,size?:number},returnType:Promise<SockResponse<{total:number,list:Partial<TableSchema>[],page:number,size:number}>>},
	"/datastore/query":{args:{schemaId:string,id:string},returnType:Promise<{ok:boolean,data:{data:Record<string, any>},warn:string}>},
	"/datastore/query/list":{args:{schemaId:string,page?:number,size?:number,filter?:Record<string, any>,sorts?:Record<string, 1|-1>},returnType:Promise<{ok:boolean,data:{list:any[],total:number,page:number,size:number},warn:string}>},
	"/datastore/query/all":{args:{schemaId:string,page?:number,size?:number,filter?:Record<string, any>,sorts?:Record<string, 1|-1>},returnType:Promise<{ok:boolean,data:{list:any[],total:number,page:number,size:number},warn:string}>},
	"/datastore/group":{args:{schemaId:string,page?:number,size?:number,filter?:Record<string, any>,sorts?:Record<string, 1|-1>,group:string},returnType:Promise<{ok:boolean,data:{list:any[],total:number,page:number,size:number},warn:string}>},
	"/datastore/statistics":{args:{schemaId:string,page?:number,size?:number,filter?:Record<string, any>,having?:Record<string, any>,sorts?:Record<string, 1|-1>,groups:string[],aggregate?: Record<string, any>},returnType:Promise<{ok:boolean,data:{list:any[],total:number,page:number,size:number},warn:string}>},
	"/datastore/statistics/value":{args:{schemaId:string,filter?:Record<string, any>,indicator:string},returnType:Promise<{ok:boolean,data:{value:number},warn:string}>},
	"/sign":{args:any,returnType:Promise<{ok:boolean,warn:string,data:{user:Record<string,any>,guid:string,token:string}}>},
	"/sign/out":{args:any,returnType:Promise<SockResponse<void>>},
	"/phone/check/sign":{args:{phone:string},returnType:Promise<{ok:boolean,warn:string,data:{sign:boolean}}>},
	"/user/query":{args:any,returnType:Promise<SockResponse<{user:Record<string,any>}>>},
	"/user/basic":{args:{userid:string},returnType:Promise<SockResponse<{user:{sn: number, avatar: ResourceArguments, name: string}}>>},
	"/user/wss":{args:any,returnType:Promise<SockResponse<{list:any[]}>>},
	"/ws/basic":{args:{name?:string,wsId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/query":{args:{wsId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/latest":{args:any,returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/invite/check":{args:{invite:string},returnType:Promise<SockResponse<{member:boolean,workspace:Record<string,any>}>>},
	"/page/items":{args:{ids:string[]},returnType:Promise<SockResponse<{ list:any[] }>>},
	"/page/item/subs":{args:{id:string},returnType:Promise<SockResponse<{ list:any[] }>>},
	"/page/item":{args:{id:string},returnType:Promise<SockResponse<{ item:Record<string,any> }>>},
	"/page/word/query":{args:{word:string},returnType:Promise<SockResponse<LinkPageItem[]>>},
	"/page/sync/block":{args:{syncBlockId:string},returnType:Promise<SockResponse<{content:string,operates:any[]}>>}
}
export interface ChannelQueryMapUrls {
    "/current/workspace":{args:any,returnType:{id:string,sn:number,text:string}},
	"/query/current/user":{args:any,returnType:User},
	"/device/query":{args:any,returnType:Promise<string>},
	"/amap/key_pair":{args:any,returnType:{key:string,pair:string}},
	"/guid":{args:any,returnType:string}
}
export interface ChannelActMapUrls {
    "/page/create/by_text":{args:{word:string},returnType:SockResponse<LinkPageItem>},
	"/page/view/operator":{args:{syncBlockId: string, operate: Partial<UserAction> },returnType:Promise<{seq: number,id: string;}>},
	"/page/view/snap":{args:{ syncBlockId: string, seq: number, content: any },returnType:Promise<void>}
}
export interface ChannelAirMapUrls {
    "/page/update/info":{args:{id: string, pageInfo:LinkPageItem},returnType:void},
	"/page/open":{args:{item:string|{id:string}},returnType:void},
	"/page/notify/toggle":{args:{id: string,visible:boolean},returnType:void},
	"/update/user":{args:{user: Record<string, any>},returnType:void}
}
    