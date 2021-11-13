
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
    loadTableSchema,
    createDefaultTableSchema,
    loadTableSchemaData,
    createTableSchemaField,
    removeTableSchemaField,
    turnTypeTableSchemaField,
    updateTableSchemaField,
    insertRow,
    updateRow,
    deleteRow,
    /**
     * 加载当前页面的信息
     */
    loadPageInfo,
    getPageInfo

}