import { UA } from "../util/ua"
import { channel } from "./channel"

export enum ElementType {
    /**
     * PageItem/{id} 文档、白板
     */
    PageItem,
    /**
     * /Page/{id}/Block/{id1} 文档中的某个块
     */
    Block,
    /**
     * /SyncBlock/${id} 同步块
     */
    SyncBlock,
    /**
     * /Schema/{id} 数据表格
     */
    Schema,
    /**
     * /Schema/{id}/Data/{id1} 数据表格的某条记录
     */
    SchemaData,
    /**
     * /Schema/{id}/View/{id1}  数据表格的视图id
     */
    SchemaView,
    /**
     * `/Schema/${id}/RecordView/${id1}` 数据表格的数据模板视图id
     */
    SchemaRecordView,
    /**
   * `/Schema/${id}/RecordView/${id1}/Data/${id2}` 数据表格的争对某条数据显示特定数据模板id
   */
    SchemaRecordViewData,
    /**
     * `/Schema/${id}/Field/${id1}/Data/${id2}`  数据表格某个字段对应的某条记录的id
     */
    SchemaFieldData,
    /**
    * `/Schema/${id}/FieldBlog/${id1}/Data/${id2}`  数据表格某个字段对应的某条记录的id
    */
    SchemaFieldBlogData,
    /**
     * `/Schema/${id}/FieldName/${id1}/Data/${id2}`  数据表格某个字段对应的某条记录的id
     */
    SchemaFieldNameData,
    /**
     * `/Schema/${id}/Field/${id1}  数据表格某个字段
     */
    SchemaField,
    /**
     * /Room/${id}/Chat/${id1} 空间聊天的某条记录
     */
    RoomChat,
    /**
     * /Room/${id} 空间聊天室
     */
    Room,
    /**
    * /Comment/${id}/emoji/${id2}
    */
    WsCommentEmoji,
}
export function getElementUrl(type: ElementType, id: string, id1?: string, id2?: string) {
    if (type == ElementType.SchemaData) return ` /Schema/${id}/Data/${id1}`
    else if (type == ElementType.SchemaView) return `/Schema/${id}/View/${id1}`
    else if (type == ElementType.SchemaRecordView) return `/Schema/${id}/RecordView/${id1}`
    else if (type == ElementType.SchemaRecordViewData) return `/Schema/${id}/RecordView/${id1}/Data/${id2}`
    else if (type == ElementType.SchemaFieldData) return `/Schema/${id}/Field/${id1}/Data/${id2}`
    else if (type == ElementType.SchemaFieldNameData) return `/Schema/${id}/FieldName/${id1}/Data/${id2}`
    else if (type == ElementType.SchemaFieldBlogData) return `/Schema/${id}/FieldBlog/${id1}/Data/${id2}`
    else if (type == ElementType.SchemaField) return `/Schema/${id}/Field/${id1}`
    else if (type == ElementType.RoomChat) return `/Room/${id}/Chat/${id1}`
    else if (type == ElementType.Block) return `/Page/${id}/Block/${id1}`
    else if (type == ElementType.SyncBlock) return `/SyncBlock/${id}`
    else if (type == ElementType.WsCommentEmoji) return `/Comment/${id}/emoji/${id1}`
    else return `/${ElementType[type]}/${id}`
}
export function parseElementUrl(url: string) {
    var us = url.split(/\//g);
    us.removeAll(g => g ? false : true);
    if (us.includes('Field') || us.includes('FieldName') || us.includes('FieldBlog')) {
        if (us.includes('FieldName')) {
            us.removeAll(g => g == 'Schema' || g == 'FieldName' || g == 'Data')
            return {
                type: ElementType.SchemaFieldNameData,
                id: us[0],
                id1: us[1],
                id2: us[2]
            }
        }
        else if (us.includes('FieldBlog')) {
            us.removeAll(g => g == 'Schema' || g == 'FieldBlog' || g == 'Data')
            return {
                type: ElementType.SchemaFieldBlogData,
                id: us[0],
                id1: us[1],
                id2: us[2]
            }
        }
        else if (us.includes('Data')) {
            us.removeAll(g => g == 'Schema' || g == 'Field' || g == 'Data')
            return {
                type: ElementType.SchemaFieldData,
                id: us[0],
                id1: us[1],
                id2: us[2]
            }
        }
        else {
            us.removeAll(g => g == 'Schema' || g == 'Field' || g == 'Data')
            return {
                type: ElementType.SchemaField,
                id: us[0],
                id1: us[1]
            }
        }
    }
    else if (us.includes('Schema')) {
        var ns = ['Schema', 'View', 'RecordView', 'Data'];
        if (us.includes('RecordView') && us.includes('Data')) {
            us.removeAll(g => ns.includes(g))
            return {
                type: ElementType.SchemaRecordViewData,
                id: us[0],
                id1: us[1],
                id2: us[2]
            }
        }
        else if (us.includes('View')) {
            us.removeAll(g => ns.includes(g))
            return {
                type: ElementType.SchemaView,
                id: us[0],
                id1: us[1],
            }
        }
        else if (us.includes('RecordView')) {
            us.removeAll(g => ns.includes(g))
            return {
                type: ElementType.SchemaRecordView,
                id: us[0],
                id1: us[1],
            }
        }
        else if (us.includes('Data')) {
            us.removeAll(g => ns.includes(g))
            return {
                type: ElementType.SchemaData,
                id: us[0],
                id1: us[1],
            }
        }
        else {
            us.removeAll(g => ns.includes(g))
            return {
                type: ElementType.Schema,
                id: us[0]
            }
        }
    }
    else if (us.includes('SyncBlock')) {
        us.removeAll(g => g == 'SyncBlock')
        return {
            type: ElementType.SyncBlock,
            id: us[0]
        }
    }
    else if (us.includes('Page')) {
        us.removeAll(g => g == 'Page' || g == 'Block');
        return {
            type: ElementType.Block,
            id: us[0],
            id1: us[1]
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
        if (us.includes('Chat')) {
            us.removeAll(g => g == 'Room' || g == 'Chat')
            return {
                type: ElementType.RoomChat,
                id: us[0],
                id1: us[1]
            }
        }
        else {
            us.removeAll(g => g == 'Room' || g == 'Chat')
            return {
                type: ElementType.Room,
                id: us[0]
            }
        }
    }
    else if (us.includes('Comment')) {
        if (us.includes('emoji')) {  
             us.removeAll(g => g == 'Comment' || g == 'emoji')
            return {
                type: ElementType.WsCommentEmoji,
                id: us[0],
                id1: us[1],
            }
        }
    }
}

export function getWsElementUrl(options: { wsUrl?: string, type: ElementType, id: string, id1?: string, id2?: string }) {
    var { type, id, id1, id2, wsUrl } = options;
    if (!wsUrl) {
        var ws = channel.query('/current/workspace');
        wsUrl=ws.url;
        // wsUrl = `https://${ws.sn}.shy.live/`;
    }
    if (!wsUrl.endsWith('/')) wsUrl += '/';
    return wsUrl + 'r?url=' + encodeURIComponent(getElementUrl(type, id, id1, id2))
}


/**
 * 对当前的图做显示性的兼容性处理
 * @param url 
 */
export function autoImageUrl(url: string, width?: 50 | 120 | 250 | 500 | 900) {
    if (!url || typeof url != 'string') {
        console.warn('auto image url is null');
        return '';
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