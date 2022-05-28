
import { TableSchema } from "../blocks/data-grid/schema/meta";
import { LinkPageItem } from "../extensions/at/declare";
import { GalleryType, OuterPic } from "../extensions/image/declare";
import { StatusCode } from "./status.code";
import { UserAction } from "../src/history/action";
import { UserBasic, UserStatus } from "../types/user";
import { AtomPermission } from "../src/page/permission";
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
	"/page/remove":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void},
	"/ws/channel/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/view/operate/notify":{args:(r:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string})=>void,returnType:void},
	"/ws/page/item/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void}
}
export interface ChannelOnlyMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo:LinkPageItem})=>void,returnType:void},
	"/page/open":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/page/remove":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void},
	"/ws/channel/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/view/operate/notify":{args:(r:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string})=>void,returnType:void},
	"/ws/page/item/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void}
}
export interface ChannelOnceMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo:LinkPageItem})=>void,returnType:void},
	"/page/open":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/page/remove":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void},
	"/ws/channel/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/view/operate/notify":{args:(r:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string})=>void,returnType:void},
	"/ws/page/item/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void}
}
export interface ChannelOffMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo:LinkPageItem})=>void,returnType:void},
	"/page/open":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/page/remove":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void},
	"/ws/channel/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/view/operate/notify":{args:(r:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string})=>void,returnType:void},
	"/ws/page/item/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void}
}
export interface ChannelFireMapUrls {
    "/log":{args:{type:"error"|"warn"|"info",message:string|Error},returnType:void},
	"/page/update/info":{args:{id: string, pageInfo:LinkPageItem},returnType:void},
	"/page/open":{args:{item:string|{id:string}},returnType:void},
	"/page/notify/toggle":{args:{id: string,visible:boolean},returnType:void},
	"/page/remove":{args:{item:string|{id:string}},returnType:void},
	"/update/user":{args:{user: Record<string, any>},returnType:void},
	"/ws/channel/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void},
	"/ws/view/operate/notify":{args:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string},returnType:void},
	"/ws/page/item/operate/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void}
}
export interface ChannelDelMapUrls {
    "/datastore/remove":{args:{schemaId:string,dataId:string},returnType:Promise<{ok:boolean,warn:string}>},
	"/user/channel/delete":{args:{id:string},returnType:Promise<SockResponse<void>>},
	"/user/write/off":{args:{sn:number},returnType:Promise<SockResponse<void>>},
	"/user/exit/ws":{args:{wsId:string},returnType:Promise<SockResponse<void>>},
	"/friend/delete":{args:{id:string},returnType:Promise<SockResponse<void>>},
	"/user/blacklist/delete":{args:{id:string},returnType:Promise<SockResponse<void>>},
	"/user/chat/cancel":{args:{id:string},returnType:Promise<SockResponse<void>>},
	"/ws/channel/cancel":{args:{id:string,sockId?:string},returnType:Promise<SockResponse<void>>},
	"/ws/member/exit":{args:{wsId:string,sock:any},returnType:Promise<SockResponse<void>>},
	"/ws/member/delete":{args:{userid:string},returnType:Promise<SockResponse<void>>},
	"/ws/role/delete":{args:{roleId:string},returnType:Promise<SockResponse<void>>}
}
export interface ChannelPostMapUrls {
    "/phone/sms/code":{args:{phone:string},returnType:Promise<{ok:boolean,warn:string,data:{success:boolean,code?:string}}>},
	"/email/send/code":{args:{email:string},returnType:Promise<SockResponse<{code?:string}>>},
	"/user/upload/file":{args:{file:File,uploadProgress: (event: ProgressEvent) => void},returnType:Promise<SockResponse<{file:{url:string}}>>},
	"/ws/upload/file":{args:{file:File,uploadProgress: (event: ProgressEvent) => void},returnType:Promise<SockResponse<{ file:{url:string,name:string,size:number} }>>},
	"/ws/download/url":{args:{url:string},returnType:Promise<SockResponse<{ file:{url:string,name:string,size:number} }>>}
}
export interface ChannelPatchMapUrls {
    "/datastore/update":{args:{schemaId:string,dataId:string,data:Record<string, any>},returnType:Promise<SockResponse<void>>},
	"/phone/check/update":{args:{phone:string,code:string},returnType:Promise<SockResponse<void>>},
	"/email/check/update":{args:{email:string,code:string},returnType:Promise<SockResponse<void>>},
	"/user/set/paw":{args:{oldPaw?:string,newPaw:string,confirmPaw:string},returnType:Promise<SockResponse<void>>},
	"/user/patch":{args:{data:Record<string,any>},returnType:Promise<SockResponse<void>>},
	"/user/patch/status":{args:{status:UserStatus,customStatus?:{overDue: Date, text: string}},returnType:Promise<SockResponse<void>>},
	"/user/channel/active":{args:{id:string},returnType:Promise<SockResponse<void>>},
	"/ws/patch":{args:{wsId?:string,sockId?:string,data:Record<string,any>},returnType:Promise<SockResponse<void>>},
	"/ws/role/patch":{args:{roleId:string,data:Record<string,any>},returnType:Promise<SockResponse<void>>},
	"/ws/set/domain":{args:{wsId?:string,domain:string},returnType:Promise<SockResponse<{exists?:boolean,illegal?:boolean}>>},
	"/ws/patch/member/roles":{args:{wsId?:string,userid:string,roleIds:string[]},returnType:Promise<SockResponse<void>>},
	"/interactive/emoji":{args:{elementUrl:string,schemaUrl:string,fieldName:string},returnType:Promise<SockResponse<{count:number}>>}
}
export interface ChannelPutMapUrls {
    "/schema/create":{args:{text:string,url:string,templateId?:string},returnType:Promise<{ ok: boolean, data: { schema:Partial<TableSchema> },warn:string }>},
	"/schema/operate":{args:{operate:{operate?:string,schemaId:string,date?:Date,actions:any[]}},returnType:Promise<SockResponse<{actions:any[]}>>},
	"/datastore/add":{args:{schemaId:string,data:Record<string, any>,pos:{dataId:string,pos:"before"|"after"}},returnType:Promise<{ok:boolean,data:{data:Record<string, any>},warn:string}>},
	"/datastore/batch/add":{args:{schemaId:string,list:any[]},returnType:Promise<{ok:boolean,data:{list:any[]},warn:string}>},
	"/datastore/query/ids":{args:{schemaId:string,ids:string[]},returnType:Promise<{ok:boolean,data:{list:any[]},warn:string}>},
	"/device/sign":{args:any,returnType:Promise<void>},
	"/phone/sign":{args:{phone:string,code:string,inviteCode:string},returnType:Promise<{ok:boolean,warn:string,data:{user:Record<string,any>,guid:string,token:string}}>},
	"/user/channel/join":{args:{roomName?:string,userids:string[]},returnType:Promise<SockResponse<{room:Record<string,any>,channel:Record<string,any>}>>},
	"/user/join/ws":{args:{wsId:string},returnType:Promise<SockResponse<void>>},
	"/friend/join":{args:{userid?:string,sn?:number},returnType:Promise<SockResponse<{exists?:boolean,send?:boolean}>>},
	"/blacklist/join":{args:{otherId:string},returnType:Promise<SockResponse<void>>},
	"/friend/agree":{args:{id:string},returnType:Promise<SockResponse<{userFriend:Record<string,any>}>>},
	"/user/chat/send":{args:{roomId:string,content?:string,file?:any,sockId:string,tos:string[]},returnType:Promise<SockResponse<{id:string,seq:number,createDate:Date}>>},
	"/ws/create":{args:{text:string,templateId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/invite/create":{args:any,returnType:Promise<SockResponse<{code:string}>>},
	"/ws/invite/join":{args:{wsId:string,sock?:any},returnType:Promise<SockResponse<void>>},
	"/ws/channel/send":{args:{roomId:string,content?:string,file?:any,sockId?:string},returnType:Promise<SockResponse<{id:string,seq:number,createDate:Date}>>},
	"/ws/role/create":{args:{data:Record<string,any>},returnType:Promise<SockResponse<{role:Record<string,any>}>>}
}
export interface ChannelGetMapUrls {
    "/gallery/query":{args:{type: GalleryType, word: string},returnType:Promise<{ok:boolean,data:OuterPic[],warn:string}>},
	"/page/query/info":{args:{id: string},returnType:Promise<SockResponse<LinkPageItem>>},
	"/schema/query":{args:{id:string},returnType:Promise<{ok:boolean,data:{schema:Partial<TableSchema>},warn:string}>},
	"/schema/list":{args:{page?:number,size?:number},returnType:Promise<SockResponse<{total:number,list:Partial<TableSchema>[],page:number,size:number}>>},
	"/schema/ids/list":{args:{ids:string[]},returnType:Promise<SockResponse<{list:Partial<TableSchema>[]}>>},
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
	"/user/basic":{args:{userid:string},returnType:Promise<SockResponse<{user:UserBasic}>>},
	"/users/basic":{args:{ids:string[]},returnType:Promise<SockResponse<{list:UserBasic[]}>>},
	"/user/wss":{args:any,returnType:Promise<SockResponse<{list:any[]}>>},
	"/user/channels":{args:{page?:number,size?:number},returnType:Promise<SockResponse<{list:any[],total:number,page:number,size:number,rooms:any[]}>>},
	"/friends":{args:{page?:number,size?:number},returnType:Promise<SockResponse<{list:any[],total:number,page:number,size:number}>>},
	"/friends/pending":{args:{page?:number,size?:number},returnType:Promise<SockResponse<{list:any[],total:number,page:number,size:number}>>},
	"/search/friends":{args:{name:string,size?:number},returnType:Promise<SockResponse<{list:UserBasic[],size:number}>>},
	"/search/friends/pending":{args:{name:string,size?:number},returnType:Promise<SockResponse<{list:UserBasic[],size:number}>>},
	"/search/blacklist":{args:{name:string,size?:number},returnType:Promise<SockResponse<{list:UserBasic[],size:number}>>},
	"/user/blacklist":{args:{page?:number,size?:number},returnType:Promise<SockResponse<{list:any[],total:number,page:number,size:number}>>},
	"/friend/is":{args:{friendId:string},returnType:Promise<SockResponse<{is:boolean}>>},
	"/user/chat/list":{args:{roomId:string,seq?:number,size?:number},returnType:Promise<SockResponse<{list:any[]}>>},
	"/ws/basic":{args:{name?:string,wsId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/info":{args:{name?:string|number,wsId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/access/info":{args:{wsId:string,pageId?:string,sock?:any},returnType:Promise<SockResponse<{roles:any[],member:Record<string,any>,page:any}>>},
	"/ws/query":{args:{wsId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/latest":{args:any,returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/invite/check":{args:{invite:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/channel/list":{args:{roomId:string,seq?:number,size?:number},returnType:Promise<SockResponse<{list:any[]}>>},
	"/ws/member/word/query":{args:{word:string},returnType:Promise<SockResponse<{page:number,size:number,total:number,list:any[]}>>},
	"/ws/members":{args:{page:number,size:number,word?:string,roleId?:string},returnType:Promise<SockResponse<{page:number,size:number,total:number,list:any[]}>>},
	"/ws/is/member":{args:{sock?:any,wsId:string},returnType:Promise<SockResponse<{exists:boolean}>>},
	"/ws/roles":{args:{},returnType:Promise<SockResponse<{list:any[]}>>},
	"/ws/role/members":{args:{roleId:string,page:number,size:number,word?:string},returnType:Promise<SockResponse<{page:number,size:number,total:number,list:any[]}>>},
	"/ws/discovery":{args:{word?:string,page?:number,size?:number,type?:string},returnType:Promise<SockResponse<{page:number,size:number,total:number,list:any[]}>>},
	"/ws/view/online/users":{args:{viewId:string},returnType:Promise<SockResponse<{ users:string[] }>>},
	"/page/items":{args:{ids:string[],sock?:any,wsId?:string},returnType:Promise<SockResponse<{ list:any[] }>>},
	"/page/item/subs":{args:{id:string},returnType:Promise<SockResponse<{ list:any[] }>>},
	"/page/item":{args:{id:string},returnType:Promise<SockResponse<{ item:Record<string,any> }>>},
	"/page/word/query":{args:{word:string},returnType:Promise<SockResponse<LinkPageItem[]>>},
	"/page/sync/block":{args:{syncBlockId:string},returnType:Promise<SockResponse<{content:string,operates:any[]}>>}
}
export interface ChannelQueryMapUrls {
    "/current/workspace":{args:any,returnType:{id:string,sn:number,text:string}},
	"/query/current/user":{args:any,returnType:UserBasic},
	"/device/query":{args:any,returnType:Promise<string>},
	"/amap/key_pair":{args:any,returnType:{key:string,pair:string}},
	"/ws/current/pages":{args:{},returnType:LinkPageItem[]},
	"/guid":{args:any,returnType:string},
	"/page/query/permissions":{args:{pageId:string},returnType:AtomPermission[]}
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
	"/page/remove":{args:{item:string|{id:string}},returnType:void},
	"/update/user":{args:{user: Record<string, any>},returnType:void},
	"/ws/channel/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void},
	"/ws/view/operate/notify":{args:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string},returnType:void},
	"/ws/page/item/operate/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void}
}
    