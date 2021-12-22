
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
    /**
     * 数据保存ctrl+s
     */
    save,
    hoverOutBlock,
    hoverBlock,
    dropLeaveBlock,
    dropEnterBlock,
    loading,
    loaded,
    change,
    error,
    warn,
    schemaLoad,
    schemaCreate,
    schemaCreateField,
    schemaRemoveField,
    schemaTurnTypeField,
    schemaUpdateField,
    schemaTableLoad,
    schemaTableLoadAll,
    schemaInsertRow,
    schemaUpdateRow,
    schemaDeleteRow,
    /**
     * 加载当前页面的信息
     */
    loadPageInfo,
    getPageInfo

}