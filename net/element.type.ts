import { UA } from "../util/ua"

export class SchemaName {
    UserDefineDataSchemaViewTemplate = 'UserDefineDataSchemaViewTemplate'
}

export enum ElementType {
    PageItem,
    Block,
    Schema,
    SchemaRecord,
    SchemaView,
    SchemaRecordView,
    SchemaRecordField,
    RoomChat
}

/***
 * 
/PageItem/id
/Block/id
/Schema/id
/Schema/id/Record/id
/Schema/id/View/id
/Schema/id/RecordView/id

 */
export function getElementUrl(type: ElementType, id: string, id1?: string, id2?: string) {
    if (type == ElementType.SchemaRecord) return ` /Schema/${id}/Record/${id1}`
    else if (type == ElementType.SchemaView) return `/Schema/${id}/View/${id1}`
    else if (type == ElementType.SchemaRecordView) return `/Schema/${id}/RecordView/${id1}`
    else if (type == ElementType.SchemaRecordField) return `/Schema/${id}/Field/${id1}/Record/${id2}`
    else if (type == ElementType.RoomChat) return `/Room/${id}/Chat/${id1}`
    else return `/${ElementType[type]}/${id}`
}

export function parseElementUrl(url: string) {
    var us = url.split(/\//g);
    us.removeAll(g => g ? false : true);
    if (us.includes('Field')) {
        us.removeAll(g => g == 'Schema' || g == 'Field' || g == 'Record')
        return {
            type: ElementType.SchemaRecordField,
            id: us[0],
            id1: us[1],
            id2: us[2]
        }
    }
    else if (us.includes('Schema')) {
        if (us.includes('Record')) {
            return {
                type: ElementType.SchemaRecord,
                id: us[0],
                id1: us[1]
            }
        }
        else if (us.includes('RecordView')) {
            return {
                type: ElementType.SchemaRecordView,
                id: us[0],
                id1: us[1]
            }
        }
        else if (us.includes('View')) {
            return {
                type: ElementType.SchemaView,
                id: us[0],
                id1: us[1]
            }
        }
    }
    else if (us.includes('Block')) {
        us.removeAll(g => g == 'Block')
        return {
            type: ElementType.Block,
            id: us[0]
        }
    }
    else if (us.includes('PageItem')) {
        us.removeAll(g => g == 'PageItem')
        return {
            type: ElementType.PageItem,
            id: us[0]
        }
    }
    else if (us.includes("Room")) {
        us.removeAll(g => g == 'Room' || g == 'Chat')
        return {
            type: ElementType.RoomChat,
            id: us[0],
            id1: us[1]
        }
    }
}

/**
 * 对当前的图做显示性的兼容性处理
 * @param url 
 */
export function autoImageUrl(url: string, width?: 50 | 120 | 250 | 500 | 900) {
    if(!url){
        console.warn('auto image url is null');
        return url;
    }
    var newUrl = url;
    if (url.startsWith('https://resources.shy.red')) newUrl = url.replace('https://resources.shy.red', 'https://resources.shy.live')
    else if (url.indexOf('shy.red') > -1) {
        newUrl = url.replace(/shy\.red/g, 'shy.live');
    }
    if (typeof width == 'number') {
        newUrl = newUrl + (newUrl.indexOf('?') > -1 ? "&" : "?") + "width=" + width;
    }
    return newUrl;
}
import "./twemoji.js";
export function getEmoji(code: string) {
    if (!UA.isMacOs) {
        return (window as any).twemoji.parse(code, {
            folder: 'svg',
            base: 'https://resources.shy.live/emoji/',
            ext: '.svg'
        });
    }
    else return code;
}