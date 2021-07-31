
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
    hoverOutBlock,
    hoverBlock,
    dropOutBlock,
    dropOverBlock,
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
    createRowDefault,
    updateRowField
}