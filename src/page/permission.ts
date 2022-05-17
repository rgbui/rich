export function getCommonPerssions()
{
    return [
        AtomPermission.sendMessageByChannel,
        AtomPermission.commentDoc,
        AtomPermission.addDataGridData,
    ]
}
export function getEditPerssions() {
    return [
        AtomPermission.sendMessageByChannel,
        AtomPermission.commentDoc,
        AtomPermission.addDataGridData,
        AtomPermission.editDoc,
        AtomPermission.editDataGrid
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
     * 是否可以编辑文档
     */
    editDoc = 100,
    /**
     * 创建文档
     * 删除文档
     * 重命名文档
     */
    createOrDeleteDoc = 101,
    /**
     * 评论文档，用户自已的可以删除
     */
    commentDoc = 102,
    /**
     * 可以主动性的删除相关的评论， 这个表示管理员
     */
    deleteComment = 103,
    /**
     * 编辑数据表格
     */
    editDataGrid = 120,
    /**
     * 删除、创建
     */
    createOrDeleteDataGrid = 121,
    /**
     * 添加数据表格数据
     */
    addDataGridData = 122,
    /**
     * 可以主动性的删除数据表格的数据， 这个表示管理员
     */
    deleteDataGridData = 123,
    /**
     * 允许发言
     */
    sendMessageByChannel = 110,
    /***
     * 允许创建或删除文本频道、修改
     */
    createOrDeleteChannel = 111,
}

export enum PagePermission {
    /**
     * 可以浏览
     */
    canView = 1000,
    /**
     * 可以编辑
     */
    canEdit = 1001,
    /**
     * 可以交互
     */
    canInteraction = 1002,
}