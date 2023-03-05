export function getCommonPerssions() {
    return [
        AtomPermission.docInteraction,
        AtomPermission.channelInteraction,
        AtomPermission.wsNotAllow,
        AtomPermission.dbInteraction,
    ]
}
export function getEditPerssions() {
    return [
        AtomPermission.docEdit,
        AtomPermission.wsEdit,
        AtomPermission.channelEdit,
        AtomPermission.dbEdit
    ]
}
export function getAllAtomPermission() {
    var ps: AtomPermission[] = [];
    for (let n in AtomPermission) {
        if (typeof AtomPermission[n] == 'number') {
            ps.push(AtomPermission[n] as any);
        }
    }
    return ps;
}

/**
 * 这是一个很细的权限列表
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


