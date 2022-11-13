export enum PageLayoutType {
    /**
     * 文档
     */
    doc = 1,
    //#region db
    db = 20,
    dbForm = 21,
    dbSubPage = 22,
    /**
     * 从表里选择一些数据的页面窗体
     */
    dbPickRecord = 23,
    /**
     * schema view
     */
    dbView = 24,
    //#endregion

    /**
     * 白板
     */
    board = 30,
    /**
     * 文字频道
     */
    textChannel = 40,


    /**
     * 博客
     * 打开的是编辑博客
     */
    blog = 60,
}

export enum PageVersion {
    v1 = '0.0.1'
}