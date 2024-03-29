
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
    syncHistory,
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