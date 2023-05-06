import lodash from "lodash";
import { PageLayoutType } from "./declare";

/**
 * 基本的权限点列表
 * 里面的值不能变动，
 * 只能增加新值，替换旧值
 */
export enum AtomPermission {


    /**
     * 页面的权限管理
     */
    docEdit = 1,
    docExport = 2,
    docView = 3,
    docInteraction = 4,
    docNotAllow = 5,


    /**
     * 频道的日常管理
     */
    channelEdit = 10,
    channelInteraction = 11,
    channelView = 12,
    channelNotAllow = 13,

    /**
     * 数据表格编辑
     */
    dbEdit = 20,
    /**
     * 数据表格数据编辑
     */
    dbDataEdit = 21,
    /**
     * 仅添加数据
     */
    dbInteraction = 22,
    /**
     * 数据不能被访问
     */
    dbNotAllow = 23,
    dbView = 24,
    /**
     * 允许管理空间
     */
    wsEdit = 31,
    /**
     * 仅允许分配成员权限
     */
    wsMemeberPermissions = 32,
    /**
     * 空间不能被管理
     */
    wsNotAllow = 33,
}


/**
 * 
 * @returns 返回正常用户的基本权限
 */
export function getCommonPerssions() {
    return [
        AtomPermission.docInteraction,
        AtomPermission.docView,
        AtomPermission.docExport,
        AtomPermission.channelInteraction,
        AtomPermission.channelView,
        AtomPermission.wsNotAllow,
        AtomPermission.dbInteraction,
        AtomPermission.dbView,
    ]
}
/**
 * 
 * @returns 返回管理的权限
 */
export function getEditPerssions() {
    return [
        ...getCommonPerssions(),
        AtomPermission.docEdit,
        AtomPermission.wsEdit,
        AtomPermission.channelEdit,
        AtomPermission.dbEdit,
        AtomPermission.dbDataEdit,
    ]
}

export function getNotAccessPerssions() {
    return [
        AtomPermission.docNotAllow,
        AtomPermission.channelNotAllow,
        AtomPermission.dbNotAllow,
    ]
}
/**
 * 
 * @returns 返回所有权限
 */
export function getAllAtomPermission() {
    var ps: AtomPermission[] = [];
    for (let n in AtomPermission) {
        if (typeof AtomPermission[n] == 'number') {
            ps.push(AtomPermission[n] as any);
        }
    }
    return ps;
}



export function getAtomPermissionComputedChanges(pageType: PageLayoutType, vs: AtomPermission[], v: AtomPermission) {
    if ([PageLayoutType.board, PageLayoutType.doc, PageLayoutType.docCard].includes(pageType)) {
        if (v == AtomPermission.docInteraction) lodash.remove(vs, g => ![AtomPermission.docExport].includes(g))
        else if (v == AtomPermission.docExport) lodash.remove(vs, g => ![AtomPermission.docInteraction].includes(g))
        else vs = []
        if (!vs.includes(v)) vs.push(v)
        return vs;
    }
    else if ([PageLayoutType.textChannel].includes(pageType)) {
        vs = []
        if (!vs.includes(v)) vs.push(v)
        return vs;
    }
    else if ([PageLayoutType.db]) {
        if (v == AtomPermission.dbDataEdit) lodash.remove(vs, g => ![AtomPermission.dbInteraction].includes(g))
        else if (v == AtomPermission.dbInteraction) lodash.remove(vs, g => ![AtomPermission.dbDataEdit].includes(g))
        else vs = []
        if (!vs.includes(v)) vs.push(v)
        return vs;
    }
}

export function getAtomPermissionOptions(pageType: PageLayoutType) {

    if ([PageLayoutType.board, PageLayoutType.doc, PageLayoutType.docCard].includes(pageType)) {
        return [
            { text: '可编辑', value: AtomPermission.docEdit },
            { text: '可导出', value: AtomPermission.docExport },
            { text: '可评论', value: AtomPermission.docInteraction },
            { text: '可查看', value: AtomPermission.docView },
            { text: '无权限', value: AtomPermission.docNotAllow },
        ]
    }
    else if ([PageLayoutType.textChannel].includes(pageType)) {
        return [
            { text: '可编辑', value: AtomPermission.channelEdit },
            { text: '可发言', value: AtomPermission.channelInteraction },
            { text: '可查看', value: AtomPermission.channelView },
            { text: '无权限', value: AtomPermission.channelNotAllow },
        ]
    }
    else if ([PageLayoutType.db]) {
        return [
            { text: '可编辑表格', value: AtomPermission.dbEdit },
            { text: '可编辑数据', value: AtomPermission.dbDataEdit },
            { text: '可添加数据', value: AtomPermission.dbInteraction },
            { text: '可查看', value: AtomPermission.dbView },
            { text: '无权限', value: AtomPermission.dbNotAllow },
        ]
    }
}

