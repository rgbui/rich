/**
 * 该指令的值不能随便变更(指令的值会存储下来，变更将导致混乱)
 * 只能新增
 */
export enum ActionDirective {
    onInputText = 100,
    onDeleteText = 101,
    onBatchDragBlocks = 102,
    onDelete = 103,
    onUndo = 104,
    onRedo = 105,
    onUpdateProps = 106,
    onUpdatePattern = 107,
    onBatchDeleteBlocks = 108,
    onCreateBlockByEnter = 109,
    onEnterCutOff = 110,
    onBatchTurn = 111,
    onDeleteSelection = 112,
    onInputDetector = 113,
    onPasteCreateBlocks = 114,
    onTurn = 115,
    combineTextSpan = 116,
    onKeyTab = 117,
    onCreateTailTextSpan = 118,
    onBackTurn = 119,
    onBatchDragBlockDatas = 120,
    onButtonTemplateCreateInstance = 121,

    onBoardToolCreateBlock = 130,
    onResizeBlock = 132,
    onLock = 133,
    onZIndex = 134,
    onRotate = 135,
    onMove = 136,
    onBoardEditProp = 137,

    onSchemaCreateField = 200,
    onSchemaDeleteField = 201,
    onSchemaTurnField = 202,
    onSchemaUpdateField = 206,
    onSchemaCreateDefaultRow = 203,
    onSchemaRowUpdate = 204,
    onSchemaRowDelete = 205,
    onSchemaShowField = 207,
    onSchemaHideField = 208,
    onTablestoreUpdateViewField = 210,
    onTablestoreHideViewField = 211,
    onCreateTableSchema = 220,
    onDataGridTurnView = 221,
    onDataGridUpdateSorts = 222,
    onDataGridUpdateFilter = 223,
    onDataGridShowRowNum = 224,
    onDataGridShowCheck = 225,
    /**
     * 错误修正的
     */
    onErrorRepairDidMounte = 300,

    onPageTurnLayout = 400

}

export enum OperatorDirective {
    /**
     * 更新文本
     */
    inputStore = 101,
    inputDeleteStore = 102,
    create = 103,
    /**
     * 删除，你可以认为是彻底的删除了,与create正好相反
     */
    delete = 104,
    /**
     * 移除，可以认为是脱离了当前节点树
     */
    // remove = 105,
    append = 107,
    /**
     * 更新属性
     */
    updateProp = 106,

    /**
     * 数组属性发生变化
     */
    arrayPropInsert = 108,
    arrayPropUpdate = 109,
    arrayPropRemove = 110,
    updatePropMatrix = 111,

    insertStyle = 200,
    mergeStyle = 201,
    deleteStyle = 202,

    schemaRowUpdate = 300,
    schemaCreateRow = 301,
    schemaRowRemove = 302,

    pageTurnLayout = 400,
}

