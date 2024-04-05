import lodash from "lodash";
import { PageLayoutType } from "./declare";
import { lst } from "../../i18n/store";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";

/**
 * 基本的权限点列表
 * 里面的值不能变动，
 * 只能增加新值，替换旧值
 */
export enum AtomPermission {

    /**
     * 所有权限
     */
    all = -1,
    /**
     * 页面的权限管理
     */
    docEdit = 1,
    docExport = 2,
    docView = 3,
    docComment = 4,
    docNotAllow = 5,

    /**
     * 频道的日常管理
     */
    channelEdit = 10,
    channelSpeak = 11,
    channelView = 12,
    channelNotAllow = 13,

    /**
     * 数据表格编辑
     */
    dbEdit = 20,
    /**
     * 数据表格数据编辑
     */
    dbEditRow = 21,
    /**
     * 仅添加数据
     */
    dbAddRow = 22,
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
        AtomPermission.docComment,
        AtomPermission.docView,
        AtomPermission.docExport,
        AtomPermission.channelSpeak,
        AtomPermission.channelView,
        AtomPermission.wsNotAllow,
        AtomPermission.dbAddRow,
        AtomPermission.dbView,
    ]
}
/**
 * 
 * @returns 返回编辑所具有的权限,不仅能编辑，也是可以查看的
 */
export function getEditOwnPerssions() {
    return [
        ...getCommonPerssions(),
        AtomPermission.docEdit,
        AtomPermission.wsEdit,
        AtomPermission.channelEdit,
        AtomPermission.dbEdit,
        AtomPermission.dbEditRow,
        AtomPermission.dbEditRow,
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
    if ([PageLayoutType.board, PageLayoutType.doc, PageLayoutType.ppt].includes(pageType)) {
        if ([AtomPermission.docComment, AtomPermission.docExport, AtomPermission.dbAddRow, AtomPermission.dbEditRow].includes(v)) lodash.remove(vs, g => ![AtomPermission.docExport, AtomPermission.dbEditRow, AtomPermission.dbAddRow, AtomPermission.docComment].includes(g))
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
        if ([AtomPermission.dbEditRow, AtomPermission.dbAddRow].includes(v)) lodash.remove(vs, g => ![AtomPermission.dbEditRow, AtomPermission.dbAddRow].includes(g))
        else vs = []
        if (!vs.includes(v)) vs.push(v)
        return vs;
    }
}

export function getAtomPermissionOptions(pageType: PageLayoutType): MenuItem[] {
    if ([PageLayoutType.board, PageLayoutType.doc, PageLayoutType.ppt].includes(pageType)) {
        return [
            { text: lst('所有权限'), value: AtomPermission.all },
            { type: MenuItemType.divide },
            { text: lst('可编辑'), value: AtomPermission.docEdit },
            { text: lst('可编辑行'), value: AtomPermission.dbEditRow },
            { type: MenuItemType.divide },
            { text: lst('可添加行'), value: AtomPermission.dbAddRow },
            { text: lst('可评论'), value: AtomPermission.docComment },
            { text: lst('可查看'), value: AtomPermission.docView },
            { type: MenuItemType.divide },
            { text: lst('无权限'), value: AtomPermission.docNotAllow },
        ]
    }
    else if ([PageLayoutType.textChannel].includes(pageType)) {
        return [
            { text: lst('所有权限'), value: AtomPermission.all },
            { type: MenuItemType.divide },
            { text: lst('可编辑'), value: AtomPermission.channelEdit },
            { type: MenuItemType.divide },
            { text: lst('可发言'), value: AtomPermission.channelSpeak },
            { text: lst('可查看'), value: AtomPermission.channelView },
            { type: MenuItemType.divide },
            { text: lst('无权限'), value: AtomPermission.channelNotAllow },
        ]
    }
    else if ([PageLayoutType.db]) {
        return [
            { text: lst('所有权限'), value: AtomPermission.all },
            { type: MenuItemType.divide },
            { text: lst('可编辑'), value: AtomPermission.dbEdit },
            { text: lst('可编辑行'), value: AtomPermission.dbEditRow },
            { type: MenuItemType.divide },
            { text: lst('可添加行'), value: AtomPermission.dbAddRow },
            { text: lst('可查看'), value: AtomPermission.dbView },
            { type: MenuItemType.divide },
            { text: lst('无权限'), value: AtomPermission.dbNotAllow },
        ]
    }
}

