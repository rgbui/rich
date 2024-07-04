import lodash from "lodash";
import { lst } from "../../i18n/store";
import { MenuItem } from "../../component/view/menu/declare";
import { LinkPageItem } from "./declare";
import { TableSchemaView } from "../../blocks/data-grid/schema/meta";
import { WorkspaceRole } from "../../types/user";

/**
 * 基本的权限点列表
 * 里面的值不能变动，
 * 只能增加新值，替换旧值
 */
export enum AtomPermission {

    pageFull = 110,
    pageEdit = 120,
    pageComment = 130,
    pageView = 140,
    pageDeny = 150,

    dbFull = 210,
    dbEdit = 220,
    dbEditRow = 230,
    dbAddRow = 240,
    dbView = 250,
    dbComment = 260,
    dbDeny = 270,

    wsFull = 310,
    wsEdit = 320,
    wsView = 330,
    wsDeny = 340,

}
/**
 * 
 * @returns 返回正常用户的基本权限
 */
export function getCommonPermission() {
    return [
        AtomPermission.pageComment,
        AtomPermission.dbComment,
        AtomPermission.wsDeny
    ]
}
/**
 * 
 * @returns 返回编辑所具有的权限,不仅能编辑，也是可以查看的
 */
export function getEditOwnPerssions() {
    return [
        AtomPermission.pageFull,
        AtomPermission.dbFull,
        AtomPermission.wsFull
    ]
}

export function getDenyPermission() {
    return [
        AtomPermission.pageDeny,
        AtomPermission.dbDeny,
        AtomPermission.wsDeny

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

export function getAtomPermissionComputedChanges(pageType: 'page' | 'db' | 'ws' | 'pageAndDb', vs: AtomPermission[], v: AtomPermission) {
    if (pageType == 'pageAndDb')
        lodash.remove(vs, g => AtomPermission[g].startsWith('page') || AtomPermission[g].startsWith('db'));
    else
        lodash.remove(vs, g => AtomPermission[g].startsWith(pageType));
    vs.push(v);
    return vs;
}

export function getAllPermissionOptions(){
    return[
        { text: lst('所有权限'), value: AtomPermission.pageFull },
        { text: lst('可编辑'), value: AtomPermission.pageEdit },
        { text: lst('可评论'), value: AtomPermission.pageComment },
        { text: lst('可查看'), value: AtomPermission.pageView },
        { text: lst('无权限'), value: AtomPermission.pageDeny },

        { text: lst('所有权限'), value: AtomPermission.dbFull },
        { text: lst('可编辑'), value: AtomPermission.dbEdit },
        { text: lst('可编辑行'), value: AtomPermission.dbEditRow },
        { text: lst('可添加行'), value: AtomPermission.dbAddRow },
        { text: lst('可评论'), value: AtomPermission.dbComment },
        { text: lst('可查看'), value: AtomPermission.dbView },
        { text: lst('无权限'), value: AtomPermission.dbDeny },

        { text: lst('所有权限'), value: AtomPermission.wsFull },
        { text: lst('可编辑'), value: AtomPermission.wsEdit },
        { text: lst('可查看'), value: AtomPermission.wsView },
        { text: lst('无权限'), value: AtomPermission.wsDeny },

    ]
}

export function getAtomPermissionOptions(pageType: 'page' | 'db' | 'ws' | 'pageAndDb'): MenuItem[] {
    if (pageType == 'page') {
        return [
            { text: lst('所有权限'), value: AtomPermission.pageFull },
            { text: lst('可编辑'), value: AtomPermission.pageEdit },
            { text: lst('可评论'), value: AtomPermission.pageComment },
            { text: lst('可查看'), value: AtomPermission.pageView },
            { text: lst('无权限'), value: AtomPermission.pageDeny },
        ]
    }
    else if (pageType == 'db') {
        return [
            { text: lst('所有权限'), value: AtomPermission.dbFull },
            { text: lst('可编辑'), value: AtomPermission.dbEdit },
            { text: lst('可编辑行'), value: AtomPermission.dbEditRow },
            { text: lst('可添加行'), value: AtomPermission.dbAddRow },
            { text: lst('可评论'), value: AtomPermission.dbComment },
            { text: lst('可查看'), value: AtomPermission.dbView },
            { text: lst('无权限'), value: AtomPermission.dbDeny },
        ]
    }
    else if (pageType == 'ws') {
        return [
            { text: lst('所有权限'), value: AtomPermission.wsFull },
            { text: lst('可编辑'), value: AtomPermission.wsEdit },
            { text: lst('可查看'), value: AtomPermission.wsView },
            { text: lst('无权限'), value: AtomPermission.wsDeny },
        ]
    }
    else if (pageType == 'pageAndDb') {
        return [
            { text: lst('所有权限'), value: AtomPermission.pageFull },
            { text: lst('可编辑'), value: AtomPermission.pageEdit },
            { text: lst('可编辑行'), value: AtomPermission.dbEditRow },
            { text: lst('可添加行'), value: AtomPermission.dbAddRow },
            { text: lst('可评论'), value: AtomPermission.pageComment },
            { text: lst('可查看'), value: AtomPermission.pageView },
            { text: lst('无权限'), value: AtomPermission.pageDeny },
        ]
    }
}



export function mergeAtomPermission(ps: AtomPermission[], newPs: AtomPermission[]) {
    var ns = ['page', 'db', 'ws'];
    var pss: AtomPermission[] = [];
    for (let n of ns) {
        var ps1 = ps.filter(g => AtomPermission[g] && AtomPermission[g].startsWith(n));
        var ps2 = newPs.filter(g => AtomPermission[g] && AtomPermission[g].startsWith(n));
        pss.push(Math.min(...ps1.concat(ps2)));
    }
    return pss;
}


export type PageSourcePermission = {
    source: 'workspacePublicAccess',
    data: { access: 1 | 0 },
    permissions: AtomPermission[]
} | {

    source: 'pageItem',
    data: LinkPageItem,
    permissions: AtomPermission[]
} | {
    source: 'wsOwner',
    permissions: AtomPermission[]
} | {
    /**
     * 数据表 表单
     */
    source: 'SchemaRecordView',
    data: Partial<TableSchemaView>,
    permissions: AtomPermission[]
} | {
    source: 'SchemaData',
    /**
     * 当前的数据，
     * 权限在data.config中
     */
    data: Record<string, any>,
    permissions: AtomPermission[]
} |
{
    source: 'wsRole',
    /**
     * 角色的id
     */
    data: WorkspaceRole[],
    permissions: AtomPermission[]
} | {
    /**
 * 空间所有用户
 */
    source: 'wsAllUser',
    permissions: AtomPermission[]
}
    | {
        source: 'schema',
        data: Partial<TableSchemaView>,
        permissions: AtomPermission[]
    }