
/***
 * 页面事件指令
 */

export enum PageDirective {
    init,
    blur,
    focus,
    focusAnchor,
    blurAnchor,
    history,
    syncPage,
    syncBlock,
    /**
     * 数据保存ctrl+s
     */
    save,
    willSave,
    saved,
    hoverOutBlock,
    hoverBlock,
    dropLeaveBlock,
    dropEnterBlock,
    loading,
    loaded,
    change,
    error,
    warn,
    selectRows,
    rollup,
    mounted,
    close,
    changePageLayout,
    spreadSln,
    reload,
    back,
    syncItems
}


export enum PageLocation {
    /**
     * 文档下面的page信息更新
     */
    pageUpdateInfo = 1,
    pageEditTitle = 3,
    pageEditDescription = 6,

    /**
     * page bar的更新
     */
    pageBarUpdateInfo = 2,


    pageSyncRefs = 4,

    schemaOperate = 5,
}

export enum PageOpenSource {
    page = "page",
    side = "slide",
    dialog = "dialog",
    snap = "snap",
    popup = "popup"
}

export enum PageOpenSourceUrl {
    page = '/page/open',
    dialog = '/page/dialog',
    slide = '/page/slide',
}