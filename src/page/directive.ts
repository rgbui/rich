
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
    pageEditTitle=3,

    /**
     * page bar的更新
     */
    pageBarUpdateInfo=2,


    pageSyncRefs=4,

    schemaOperate=5,
}