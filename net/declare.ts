
import { TableSchema } from "../blocks/data-grid/schema/meta";
import { LinkPageItem } from "../extensions/at/declare";
import { GalleryType, OuterPic } from "../extensions/image/declare";
import { StatusCode } from "./status.code";
import { UserAction } from "../src/history/action";
import { UserBasic, UserStatus } from "../types/user";
import { AtomPermission } from "../src/page/permission";
import { ResourceArguments } from "../extensions/icon/declare";
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
	"/page/open":{args:(r:{item:string|{id:string},blockId?:string})=>void,returnType:void},
	"/page/dialog":{args:(r:{elementUrl:string})=>any,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/page/remove":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void},
	"/page/create/sub":{args:(r:{pageId:string,text:string})=>LinkPageItem,returnType:void},
	"/user/basic/sync":{args:(r:{id:string})=>void,returnType:void},
	"/ws/channel/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/channel/patch/notify":{args:(r:{ workspaceId: string,roomId: string,content: string,file: any,isEdited:boolean})=>void,returnType:void},
	"/ws/channel/deleted/notify":{args:(r:{ workspaceId: string,id:string,roomId:string})=>void,returnType:void},
	"/ws/channel/emoji/notify":{args:(r:{workspaceId: string,id: string,roomId: string,emoji:{ emojiId: string, code?: string }})=>void,returnType:void},
	"/ws/view/operate/notify":{args:(r:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string})=>void,returnType:void},
	"/ws/page/item/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void}
}
export interface ChannelOnlyMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo:LinkPageItem})=>void,returnType:void},
	"/page/open":{args:(r:{item:string|{id:string},blockId?:string})=>void,returnType:void},
	"/page/dialog":{args:(r:{elementUrl:string})=>any,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/page/remove":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void},
	"/page/create/sub":{args:(r:{pageId:string,text:string})=>LinkPageItem,returnType:void},
	"/user/basic/sync":{args:(r:{id:string})=>void,returnType:void},
	"/ws/channel/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/channel/patch/notify":{args:(r:{ workspaceId: string,roomId: string,content: string,file: any,isEdited:boolean})=>void,returnType:void},
	"/ws/channel/deleted/notify":{args:(r:{ workspaceId: string,id:string,roomId:string})=>void,returnType:void},
	"/ws/channel/emoji/notify":{args:(r:{workspaceId: string,id: string,roomId: string,emoji:{ emojiId: string, code?: string }})=>void,returnType:void},
	"/ws/view/operate/notify":{args:(r:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string})=>void,returnType:void},
	"/ws/page/item/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void}
}
export interface ChannelOnceMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo:LinkPageItem})=>void,returnType:void},
	"/page/open":{args:(r:{item:string|{id:string},blockId?:string})=>void,returnType:void},
	"/page/dialog":{args:(r:{elementUrl:string})=>any,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/page/remove":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void},
	"/page/create/sub":{args:(r:{pageId:string,text:string})=>LinkPageItem,returnType:void},
	"/user/basic/sync":{args:(r:{id:string})=>void,returnType:void},
	"/ws/channel/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/channel/patch/notify":{args:(r:{ workspaceId: string,roomId: string,content: string,file: any,isEdited:boolean})=>void,returnType:void},
	"/ws/channel/deleted/notify":{args:(r:{ workspaceId: string,id:string,roomId:string})=>void,returnType:void},
	"/ws/channel/emoji/notify":{args:(r:{workspaceId: string,id: string,roomId: string,emoji:{ emojiId: string, code?: string }})=>void,returnType:void},
	"/ws/view/operate/notify":{args:(r:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string})=>void,returnType:void},
	"/ws/page/item/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void}
}
export interface ChannelOffMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo:LinkPageItem})=>void,returnType:void},
	"/page/open":{args:(r:{item:string|{id:string},blockId?:string})=>void,returnType:void},
	"/page/dialog":{args:(r:{elementUrl:string})=>any,returnType:void},
	"/page/notify/toggle":{args:(r:{id: string,visible:boolean})=>void,returnType:void},
	"/page/remove":{args:(r:{item:string|{id:string}})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void},
	"/page/create/sub":{args:(r:{pageId:string,text:string})=>LinkPageItem,returnType:void},
	"/user/basic/sync":{args:(r:{id:string})=>void,returnType:void},
	"/ws/channel/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/channel/patch/notify":{args:(r:{ workspaceId: string,roomId: string,content: string,file: any,isEdited:boolean})=>void,returnType:void},
	"/ws/channel/deleted/notify":{args:(r:{ workspaceId: string,id:string,roomId:string})=>void,returnType:void},
	"/ws/channel/emoji/notify":{args:(r:{workspaceId: string,id: string,roomId: string,emoji:{ emojiId: string, code?: string }})=>void,returnType:void},
	"/ws/view/operate/notify":{args:(r:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string})=>void,returnType:void},
	"/ws/page/item/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:(r:{id:string,workspaceId:string,roomId:string})=>void,returnType:void}
}
export interface ChannelFireMapUrls {
    "/log":{args:{type:"error"|"warn"|"info",message:string|Error},returnType:void},
	"/page/update/info":{args:{id: string, pageInfo:LinkPageItem},returnType:void},
	"/page/open":{args:{item:string|{id:string},blockId?:string},returnType:void},
	"/page/dialog":{args:{elementUrl:string},returnType:any},
	"/page/notify/toggle":{args:{id: string,visible:boolean},returnType:void},
	"/page/remove":{args:{item:string|{id:string}},returnType:void},
	"/update/user":{args:{user: Record<string, any>},returnType:void},
	"/page/create/sub":{args:{pageId:string,text:string},returnType:LinkPageItem},
	"/user/basic/sync":{args:{id:string},returnType:void},
	"/ws/channel/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void},
	"/ws/channel/patch/notify":{args:{ workspaceId: string,roomId: string,content: string,file: any,isEdited:boolean},returnType:void},
	"/ws/channel/deleted/notify":{args:{ workspaceId: string,id:string,roomId:string},returnType:void},
	"/ws/channel/emoji/notify":{args:{workspaceId: string,id: string,roomId: string,emoji:{ emojiId: string, code?: string }},returnType:void},
	"/ws/view/operate/notify":{args:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string},returnType:void},
	"/ws/page/item/operate/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void}
}
export interface ChannelDelMapUrls {
    "/schema/delete":{args:{wsId?:string,id:string},returnType:Promise<SockResponse<void>>},
	"/datastore/remove":{args:{schemaId:string,dataId:string},returnType:Promise<{ok:boolean,warn:string}>},
	"/user/channel/delete":{args:{id:string},returnType:Promise<SockResponse<void>>},
	"/user/write/off":{args:{sn:number},returnType:Promise<SockResponse<void>>},
	"/user/exit/ws":{args:{wsId:string},returnType:Promise<SockResponse<void>>},
	"/friend/delete":{args:{id:string},returnType:Promise<SockResponse<void>>},
	"/user/blacklist/delete":{args:{id:string},returnType:Promise<SockResponse<void>>},
	"/user/chat/cancel":{args:{id:string,roomId:string},returnType:Promise<SockResponse<void>>},
	"/user/del/order":{args:{orderId:string},returnType:Promise<SockResponse<void>>},
	"/open/weixin/unbind":{args:{id:string},returnType:Promise<SockResponse<void>>},
	"/ws/channel/cancel":{args:{roomId: string, id: string, wsId?: string, sockId?: string},returnType:Promise<SockResponse<void>>},
	"/ws/member/exit":{args:{wsId:string,sock:any},returnType:Promise<SockResponse<void>>},
	"/ws/member/delete":{args:{userid:string},returnType:Promise<SockResponse<void>>},
	"/ws/role/delete":{args:{roleId:string},returnType:Promise<SockResponse<void>>},
	"/view/snap/del":{args:{id:string},returnType:Promise<SockResponse<void>>}
}
export interface ChannelPostMapUrls {
    "/phone/sms/code":{args:{phone:string},returnType:Promise<{ok:boolean,warn:string,data:{success:boolean,code?:string}}>},
	"/email/send/code":{args:{email:string},returnType:Promise<SockResponse<{code?:string}>>},
	"/user/upload/file":{args:{file:File,uploadProgress: (event: ProgressEvent) => void},returnType:Promise<SockResponse<{file:{url:string}}>>},
	"/ws/upload/file":{args:{file:File,uploadProgress: (event: ProgressEvent) => void},returnType:Promise<SockResponse<{ file:{url:string,name:string,size:number} }>>},
	"/ws/download/url":{args:{url:string},returnType:Promise<SockResponse<{ file:{url:string,name:string,size:number} }>>},
	"/view/snap/rollup":{args:{id:string,elementUrl:string,wsId?:string,bakeTitle?:string,pageTitle?:string},returnType:Promise<SockResponse<{seq:number,id:string}>>}
}
export interface ChannelPatchMapUrls {
    "/datastore/update":{args:{schemaId:string,dataId:string,data:Record<string, any>},returnType:Promise<SockResponse<void>>},
	"/sign/patch":{args:{name: string, paw: string},returnType:Promise<SockResponse<{list:any[]}>>},
	"/phone/check/update":{args:{phone:string,code:string},returnType:Promise<SockResponse<void>>},
	"/email/check/update":{args:{email:string,code:string},returnType:Promise<SockResponse<void>>},
	"/user/set/paw":{args:{oldPaw?:string,newPaw:string,confirmPaw:string},returnType:Promise<SockResponse<void>>},
	"/user/patch":{args:{data:Record<string,any>},returnType:Promise<SockResponse<void>>},
	"/user/patch/status":{args:{status:UserStatus,customStatus?:{overDue: Date, text: string}},returnType:Promise<SockResponse<void>>},
	"/user/channel/active":{args:{id:string},returnType:Promise<SockResponse<void>>},
	"/user/chat/patch":{args:{id:string,roomId:string,content?:string,file?:any},returnType:Promise<SockResponse<void>>},
	"/ws/patch":{args:{wsId?:string,sockId?:string,data:Record<string,any>},returnType:Promise<SockResponse<void>>},
	"/ws/channel/patch":{args:{id: string,sockId?: string,wsId?: string,roomId: string,content?: string,replyId?: string,file?:any},returnType:Promise<SockResponse<void>>},
	"/ws/role/patch":{args:{roleId:string,data:Record<string,any>},returnType:Promise<SockResponse<void>>},
	"/ws/set/domain":{args:{wsId?:string,domain:string},returnType:Promise<SockResponse<{exists?:boolean,illegal?:boolean}>>},
	"/ws/patch/member/roles":{args:{wsId?:string,userid:string,roleIds:string[]},returnType:Promise<SockResponse<void>>},
	"/view/snap/patch":{args:{id:string,data:Record<string,any>},returnType:Promise<SockResponse<void>>},
	"/block/ref/sync":{args:{wsId?:string,data:{deleteBlockIds: string[], updates: { rowBlockId: string, text: string }[]}},returnType:Promise<SockResponse<void>>},
	"/interactive/emoji":{args:{elementUrl:string,schemaUrl:string,fieldName:string},returnType:Promise<SockResponse<{count:number}>>}
}
export interface ChannelPutMapUrls {
    "/schema/create":{args:{text:string,url:string,templateId?:string},returnType:Promise<{ ok: boolean, data: { schema:Partial<TableSchema> },warn:string }>},
	"/schema/operate":{args:{operate:{operate?:string,schemaId:string,date?:Date,actions:any[]}},returnType:Promise<SockResponse<{actions:any[]}>>},
	"/datastore/add":{args:{schemaId:string,data:Record<string, any>,pos:{dataId:string,pos:"before"|"after"}},returnType:Promise<SockResponse<{isCacSort:boolean,data:Record<string,any>}>>},
	"/datastore/batch/add":{args:{schemaId:string,list:any[]},returnType:Promise<{ok:boolean,data:{list:any[]},warn:string}>},
	"/datastore/query/ids":{args:{schemaId:string,ids:string[]},returnType:Promise<{ok:boolean,data:{list:any[]},warn:string}>},
	"/datastore/rank":{args:{schemaId:string,wsId?:string,id:string,pos:{dataId:string,pos:"before"|"after"}},returnType:Promise<SockResponse<{isCacSort:boolean,sort:number}>>},
	"/device/sign":{args:any,returnType:Promise<void>},
	"/paw/sign":{args:{phone:string,paw:string,inviteCode:string,weixinOpen:Record<string,any>},returnType:Promise<SockResponse<{user:Record<string,any>,guid:string,token:string}>>},
	"/phone/sign":{args:{phone:string,code:string,inviteCode:string,weixinOpen:Record<string,any>},returnType:Promise<SockResponse<{user:Record<string,any>,guid:string,token:string}>>},
	"/user/channel/join":{args:{roomName?:string,userids:string[]},returnType:Promise<SockResponse<{room:Record<string,any>,channel:Record<string,any>}>>},
	"/user/join/ws":{args:{wsId:string},returnType:Promise<SockResponse<void>>},
	"/friend/join":{args:{userid?:string,sn?:number},returnType:Promise<SockResponse<{exists?:boolean,send?:boolean,refuse?:boolean,black?:boolean}>>},
	"/blacklist/join":{args:{otherId:string},returnType:Promise<SockResponse<void>>},
	"/friend/agree":{args:{id:string},returnType:Promise<SockResponse<{userFriend:Record<string,any>}>>},
	"/user/chat/send":{args:{roomId:string,content?:string,file?:any,tos:string[],replyId?:string},returnType:Promise<SockResponse<{id:string,seq:number,createDate:Date}>>},
	"/user/chat/emoji":{args:{id:string,roomId:string,emoji:{emojiId: string, code?: string}},returnType:Promise<SockResponse<{emoji:{emojiId: string, code?: string,count:number}}>>},
	"/create/qr_pay/order":{args:{subject: string,body: string,price: number,count: number,amount?: number,kind: string},returnType:Promise<SockResponse<{orderId:string,code:string}>>},
	"/open/weixin/bind":{args:{weixinOpen:any},returnType:Promise<SockResponse<void>>},
	"/open/sign":{args:{},returnType:Promise<SockResponse<{user:Record<string,any>,guid:string,token:string}>>},
	"/ws/create":{args:{text:string,templateId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/invite/create":{args:any,returnType:Promise<SockResponse<{code:string}>>},
	"/ws/invite/join":{args:{wsId:string,sock?:any},returnType:Promise<SockResponse<void>>},
	"/ws/channel/send":{args:{ sockId?: string,wsId?: string,roomId: string,content?: string,replyId?: string, file?:any},returnType:Promise<SockResponse<{id:string,seq:number,createDate:Date}>>},
	"/ws/channel/emoji":{args:{elementUrl: string,sockId?: string, wsId?: string, emoji: { emojiId: string, code?: string }},returnType:Promise<SockResponse<{emoji:{emojiId:string,code?:string,count:number}}>>},
	"/ws/role/create":{args:{data:Record<string,any>},returnType:Promise<SockResponse<{role:Record<string,any>}>>},
	"/block/ref/add":{args:{wsId?:string,pageId:string,data:{blockId: string, rowBlockId: string, text: string, refPageId: string}},returnType:Promise<SockResponse<void>>},
	"/bookmark/url":{args:{url:string},returnType:Promise<SockResponse<{title:string,description:string,image:ResourceArguments,icon:ResourceArguments}>>}
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
	"/sign":{args:any,returnType:Promise<SockResponse<{user:Record<string,any>,guid:string,token:string}>>},
	"/sign/out":{args:any,returnType:Promise<SockResponse<void>>},
	"/phone/check/sign":{args:{phone:string},returnType:Promise<{ok:boolean,warn:string,data:{sign:boolean}}>},
	"/user/query":{args:any,returnType:Promise<SockResponse<{user:Record<string,any>}>>},
	"/user/basic":{args:{userid:string},returnType:Promise<SockResponse<{user:UserBasic}>>},
	"/users/basic":{args:{ids:string[]},returnType:Promise<SockResponse<{list:UserBasic[]}>>},
	"/user/wss":{args:any,returnType:Promise<SockResponse<{list:any[]}>>},
	"/user/channels":{args:{page?:number,size?:number},returnType:Promise<SockResponse<{list:any[],total:number,page:number,size:number,rooms:any[]}>>},
	"/user/channel/create":{args:{roomId:string},returnType:Promise<SockResponse<{channel:any,room:any}>>},
	"/user/word/query":{args:{word:string},returnType:Promise<SockResponse<{list:{id:string}[]}>>},
	"/friends":{args:{page?:number,size?:number},returnType:Promise<SockResponse<{list:any[],total:number,page:number,size:number}>>},
	"/friends/pending":{args:{page?:number,size?:number},returnType:Promise<SockResponse<{list:any[],total:number,page:number,size:number}>>},
	"/search/friends":{args:{name:string,size?:number},returnType:Promise<SockResponse<{list:UserBasic[],size:number}>>},
	"/search/friends/pending":{args:{name:string,size?:number},returnType:Promise<SockResponse<{list:UserBasic[],size:number}>>},
	"/search/blacklist":{args:{name:string,size?:number},returnType:Promise<SockResponse<{list:UserBasic[],size:number}>>},
	"/user/blacklist":{args:{page?:number,size?:number},returnType:Promise<SockResponse<{list:any[],total:number,page:number,size:number}>>},
	"/friend/is":{args:{friendId:string},returnType:Promise<SockResponse<{is:boolean}>>},
	"/user/chat/list":{args:{roomId:string,seq?:number,size?:number},returnType:Promise<SockResponse<{list:any[]}>>},
	"/user/room/unread":{args:{unrooms: { roomId: string, seq: number }[]},returnType:Promise<SockResponse<{unreads:{roomId:string,count:number}[]}>>},
	"/repeat/qr_pay/order":{args:{orderId:string,platform:string},returnType:Promise<SockResponse<{orderId:string,code:string}>>},
	"/user/order/list":{args:{page?: number, size?: number, word?: string, status?: string,deal?:boolean},returnType:Promise<SockResponse<{page:number,size:number,list:any[],total:number}>>},
	"/user/wallet":{args:{},returnType:Promise<SockResponse<{money:number,meal:string}>>},
	"/open/list":{args:any,returnType:Promise<SockResponse<{list:any[]}>>},
	"/ws/basic":{args:{name?:string,wsId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/info":{args:{name?:string|number,wsId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/access/info":{args:{wsId:string,pageId?:string,sock?:any},returnType:Promise<SockResponse<{roles:any[],member:Record<string,any>,page:any,onlineUsers:string[]}>>},
	"/ws/query":{args:{wsId?:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/latest":{args:any,returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/invite/check":{args:{invite:string},returnType:Promise<SockResponse<{workspace:Record<string,any>}>>},
	"/ws/channel/list":{args:{roomId:string,seq?:number,page?:number,size?:number},returnType:Promise<SockResponse<{list:any[],unreadCount?:number}>>},
	"/ws/random/online/users":{args:{wsId:string,size?:number},returnType:Promise<SockResponse<{count:number,users:string[]}>>},
	"/ws/online/users":{args:{wsId:string},returnType:Promise<SockResponse<{users:string[]}>>},
	"/ws/channel/abled/send":{args:{wsId?:string,roomId:string,pageId:string},returnType:Promise<SockResponse<{abled:boolean}>>},
	"/ws/member/word/query":{args:{word:string},returnType:Promise<SockResponse<{page:number,size:number,total:number,list:any[]}>>},
	"/ws/members":{args:{page:number,size:number,word?:string,roleId?:string},returnType:Promise<SockResponse<{page:number,size:number,total:number,list:any[]}>>},
	"/ws/is/member":{args:{sock?:any,wsId:string},returnType:Promise<SockResponse<{exists:boolean}>>},
	"/ws/roles":{args:{},returnType:Promise<SockResponse<{list:any[]}>>},
	"/ws/role/members":{args:{roleId:string,page:number,size:number,word?:string},returnType:Promise<SockResponse<{page:number,size:number,total:number,list:any[]}>>},
	"/ws/discovery":{args:{word?:string,page?:number,size?:number,type?:string},returnType:Promise<SockResponse<{page:number,size:number,total:number,list:any[]}>>},
	"/ws/view/online/users":{args:{viewId:string},returnType:Promise<SockResponse<{ users:string[] }>>},
	"/ws/search":{args:{page?:number,size?:number,mime?:string,word:string,wsId?:string,isOnlySearchTitle?:boolean,createDate?:number,editDate?:number},returnType:Promise<SockResponse<{ list:{id:string,title:string,content:string,score:number}[],total:number }>>},
	"/page/items":{args:{ids:string[],sock?:any,wsId?:string},returnType:Promise<SockResponse<{ list:any[] }>>},
	"/page/item/subs":{args:{id:string},returnType:Promise<SockResponse<{ list:any[] }>>},
	"/page/item":{args:{id:string},returnType:Promise<SockResponse<{ item:Record<string,any> }>>},
	"/page/word/query":{args:{word:string},returnType:Promise<SockResponse<{list:LinkPageItem[],total:number,page:number,size:number}>>},
	"/view/snap/query":{args:{ elementUrl: string},returnType:Promise<SockResponse<{content:string,operates:any[]}>>},
	"/view/snap/list":{args:{wsId?: string, elementUrl: string, page: number, size: number},returnType:Promise<SockResponse<{list:any[],total:number,size:number,page:number}>>},
	"/view/snap/content":{args:{wsId?:string,id:string},returnType:Promise<SockResponse<{id:string,content:string}>>},
	"/block/ref/pages":{args:{wsId?:string,pageId:string},returnType:Promise<SockResponse<{list:any[],total:number,size:number,page:number}>>}
}
export interface ChannelQueryMapUrls {
    "/current/workspace":{args:any,returnType:{id:string,sn:number,text:string}},
	"/query/current/user":{args:any,returnType:UserBasic},
	"/cache/get":{args:{key:string},returnType:Promise<any>},
	"/device/query":{args:any,returnType:Promise<string>},
	"/amap/key_pair":{args:any,returnType:{key:string,pair:string}},
	"/ws/current/pages":{args:{},returnType:LinkPageItem[]},
	"/guid":{args:any,returnType:string},
	"/page/query/permissions":{args:{pageId:string},returnType:AtomPermission[]}
}
export interface ChannelActMapUrls {
    "/page/create/by_text":{args:{word:string},returnType:SockResponse<LinkPageItem>},
	"/cache/set":{args:{key:string,value:any},returnType:Promise<void>},
	"/view/snap/operator":{args:{ elementUrl: string, operate: Partial<UserAction> },returnType:Promise<{seq: number,id: string;}>},
	"/view/snap/store":{args:{  elementUrl: string, seq: number, content: any },returnType:Promise<void>}
}
export interface ChannelAirMapUrls {
    "/page/update/info":{args:{id: string, pageInfo:LinkPageItem},returnType:void},
	"/page/open":{args:{item:string|{id:string},blockId?:string},returnType:void},
	"/page/dialog":{args:{elementUrl:string},returnType:any},
	"/page/notify/toggle":{args:{id: string,visible:boolean},returnType:void},
	"/page/remove":{args:{item:string|{id:string}},returnType:void},
	"/update/user":{args:{user: Record<string, any>},returnType:void},
	"/page/create/sub":{args:{pageId:string,text:string},returnType:LinkPageItem},
	"/user/basic/sync":{args:{id:string},returnType:void},
	"/ws/channel/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void},
	"/ws/channel/patch/notify":{args:{ workspaceId: string,roomId: string,content: string,file: any,isEdited:boolean},returnType:void},
	"/ws/channel/deleted/notify":{args:{ workspaceId: string,id:string,roomId:string},returnType:void},
	"/ws/channel/emoji/notify":{args:{workspaceId: string,id: string,roomId: string,emoji:{ emojiId: string, code?: string }},returnType:void},
	"/ws/view/operate/notify":{args:{id:string,directive:number,operators:any[],elementUrl:string,workspaceId:string,userid:string},returnType:void},
	"/ws/page/item/operate/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void},
	"/ws/datagrid/schema/operate/notify":{args:{id:string,workspaceId:string,roomId:string},returnType:void}
}
    