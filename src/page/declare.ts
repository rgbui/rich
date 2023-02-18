export enum PageLayoutType {
    /**
     * 文档
     */
    doc = 1,
    docCard = 2,
    //#region db
    db = 20,
    dbForm = 21,
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

export enum PageLayout {
    page = 1,//类似notion的网页版  题头图
    content = 2, //类似网页内容 设置背景色

    content13 = 3,//类似网页内容 1:3  可以设置背景色 ，内容可适明，可不透明
    content31 = 4,//类似网页内容 3:1
    content121 = 5,//类似网页内容 1:2:1
    content111 = 6,//类似网页内容 1:1:1

    contentTable = 10, //内容表格，如excel展示那样
}