
import { Field } from "../blocks/data-grid/schema/field";
import { TableSchema } from "../blocks/data-grid/schema/meta";
import { FieldType } from "../blocks/data-grid/schema/type";
import { LinkPage } from "../extensions/at/declare";
import { IconArguments, ResourceArguments } from "../extensions/icon/declare";
import { GalleryType, OuterPic } from "../extensions/image/declare";
import { User } from "../src/types/user";
export interface ChannelSyncMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo: { text: string, icon?: IconArguments }})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void}
}
export interface ChannelOnlyMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo: { text: string, icon?: IconArguments }})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void}
}
export interface ChannelOnceMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo: { text: string, icon?: IconArguments }})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void}
}
export interface ChannelOffMapUrls {
    "/log":{args:(r:{type:"error"|"warn"|"info",message:string|Error})=>void,returnType:void},
	"/page/update/info":{args:(r:{id: string, pageInfo: { text: string, icon?: IconArguments }})=>void,returnType:void},
	"/update/user":{args:(r:{user: Record<string, any>})=>void,returnType:void}
}
export interface ChannelFireMapUrls {
    "/log":{args:{type:"error"|"warn"|"info",message:string|Error},returnType:void},
	"/page/update/info":{args:{id: string, pageInfo: { text: string, icon?: IconArguments }},returnType:void},
	"/update/user":{args:{user: Record<string, any>},returnType:void}
}
export interface ChannelDelMapUrls {
    "/schema/field/remove":{args:{schemaId:string,fieldId:string},returnType:Promise<{ok:boolean,warn:string}>},
	"/datastore/remove":{args:{schemaId:string,dataId:string},returnType:Promise<{ok:boolean,warn:string}>}
}
export interface ChannelPostMapUrls {
    "/upload/file":{args:{file:File,uploadProgress: (event: ProgressEvent) => void},returnType:Promise<{ ok: boolean, data: { url: string },warn:string }>},
	"/workspace/upload/file":{args:{file:File,uploadProgress: (event: ProgressEvent) => void},returnType:Promise<{ ok: boolean, data: { url: string },warn:string }>},
	"/workspace/upload/file/url":{args:{url:string},returnType:Promise<{ ok: boolean, data: { url: string },warn:string }>},
	"/schema/field/update":{args:{schemaId:string,fieldId:string,data:Partial<Field>},returnType:Promise<{ok:boolean,data:{field:Partial<Field>},warn:string}>},
	"/schema/field/turn":{args:{schemaId:string,fieldId:string,type:FieldType},returnType:Promise<{ok:boolean,data:{field:Partial<Field>},warn:string}>},
	"/datastore/update":{args:{schemaId:string,dataId:string,data:Record<string, any>},returnType:Promise<{ok:boolean,warn:string}>}
}
export interface ChannelPutMapUrls {
    "/schema/create":{args:{text:string,templateId?:string},returnType:Promise<{ ok: boolean, data: { schema:Partial<TableSchema> },warn:string }>},
	"/schema/field/add":{args:{schemaId:string,text:string,type:FieldType},returnType:Promise<{ok:boolean,data:{field:Partial<Field>},warn:string}>},
	"/datastore/add":{args:{schemaId:string,data:Record<string, any>,pos:{dataId:string,pos:"before"|"after"}},returnType:Promise<{ok:boolean,data:{data:Record<string, any>},warn:string}>},
	"/datastore/batch/add":{args:{schemaId:string,list:any[]},returnType:Promise<{ok:boolean,data:{list:any[]},warn:string}>},
	"/datastore/query/ids":{args:{schemaId:string,ids:string[]},returnType:Promise<{ok:boolean,data:{list:any[]},warn:string}>}
}
export interface ChannelGetMapUrls {
    "/gallery/query":{args:{type: GalleryType, word: string},returnType:Promise<{ok:boolean,data:OuterPic[],warn:string}>},
	"/page/query/links":{args:{word:string},returnType:Promise<{ok:boolean,data:LinkPage[],warn:string}>},
	"/page/query/info":{args:{id: string},returnType:Promise<{ok:boolean,data:LinkPage,warn:string}>},
	"/workspace/query/schemas":{args:{page?:number,size?:number},returnType:Promise<{ok:boolean,data:{total:number,list:Partial<TableSchema>[],page:number,size:number},warn:string}>},
	"/schema/query":{args:{id:string},returnType:Promise<{ok:boolean,data:{schema:Partial<TableSchema>},warn:string}>},
	"/datastore/query":{args:{schemaId:string,id:string},returnType:Promise<{ok:boolean,data:{data:Record<string, any>},warn:string}>},
	"/datastore/query/list":{args:{schemaId:string,page?:number,size?:number,filter?:Record<string, any>,sorts?:Record<string, 1|-1>},returnType:Promise<{ok:boolean,data:{list:any[],total:number,page:number,size:number},warn:string}>},
	"/datastore/query/all":{args:{schemaId:string,page?:number,size?:number,filter?:Record<string, any>,sorts?:Record<string, 1|-1>},returnType:Promise<{ok:boolean,data:{list:any[],total:number,page:number,size:number},warn:string}>},
	"/datastore/group":{args:{schemaId:string,page?:number,size?:number,filter?:Record<string, any>,sorts?:Record<string, 1|-1>,group:string},returnType:Promise<{ok:boolean,data:{list:any[],total:number,page:number,size:number},warn:string}>},
	"/datastore/statistics":{args:{schemaId:string,page?:number,size?:number,filter?:Record<string, any>,having?:Record<string, any>,sorts?:Record<string, 1|-1>,groups:string[],aggregate?: Record<string, any>},returnType:Promise<{ok:boolean,data:{list:any[],total:number,page:number,size:number},warn:string}>},
	"/datastore/statistics/value":{args:{schemaId:string,filter?:Record<string, any>,indicator:string},returnType:Promise<{ok:boolean,data:{value:number},warn:string}>},
	"/user/ping":{args:any,returnType:Promise<{ok:boolean,warn:string}>},
	"/user/basic":{args:{userid:string},returnType:Promise<{ok:boolean,warn:string,data:{sn: number, avatar: ResourceArguments, name: string}}>}
}
export interface ChannelQueryMapUrls {
    "/workspace/query/users":{args:any,returnType:User[]},
	"/query/current/user":{args:any,returnType:User},
	"/device/query":{args:any,returnType:Promise<string>},
	"/amap/key_pair":{args:any,returnType:{key:string,pair:string}}
}
export interface ChannelActMapUrls {
    "/page/create/by_text":{args:{word:string},returnType:{ok:boolean,data:LinkPage,warn:string}},
	"/page/open":{args:{item:string|{id:string}},returnType:void},
	"/page/notify/toggle":{args:{id: string,visible:boolean},returnType:void},
	"/device/register":{args:any,returnType:Promise<void>}
}
export interface ChannelAirMapUrls {
    "/page/update/info":{args:{id: string, pageInfo: { text: string, icon?: IconArguments }},returnType:void},
	"/update/user":{args:{user: Record<string, any>},returnType:void}
}
    