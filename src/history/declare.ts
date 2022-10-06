/**
 * 该指令的值不能随便变更(指令的值会存储下来，变更将导致混乱)
 * 只能新增
 * 
 */
export enum ActionDirective {
    onInputText = 100,
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
    onLoadUserActions = 122,
    onCopyBlock = 123,
    onSolidBlockInputTextContent = 124,

    onBoardToolCreateBlock = 130,
    onResizeBlock = 132,
    onLock = 133,
    onZIndex = 134,
    onRotate = 135,
    onMove = 136,
    onBoardEditProp = 137,
    onBookMark = 138,
    onUpdateEquation = 139,

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
    onDataGridChangeFields = 226,
    onDataGridChangeSize = 227,
    /**
     * 错误修正的
     */
    onErrorRepairDidMounte = 300,
    onPageTurnLayout = 400,
    onPageUpdateProps = 401,
    AutomaticHandle = 410,//页面加载后的自动触发的一些行为
    /**
     * 一些特殊的block操作
     */
    onTabAddItem = 500,
    onTabRemoveItem = 501,
    onTabExchangeItem = 502,
    onCarouselAddItem = 510,
    onCarouselRemoveItem = 511,
    onMindAddSub = 512,
}

export enum OperatorDirective {
    /***
     * 创建新块
     */
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
     * 块的相互转换
     */
    turn = 102,

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
    pageUpdateProp = 401,


    /**
     * 记录光标的位置
     */
    keepCursorOffset = 500,

    changeCursorPos = 501,



    //#region  新的指令，以1000~2000为主

    /**
     * https://github.com/yjs/yjs
     * 
     */
    $create = 1000,
    $delete = 1001,
    $move = 1002,
    $turn = 1003,
    $update = 1004,
    $map_splice = 1005,

    $insert_style = 1006,
    $merge_style = 1007,
    $delete_style = 1008,

    $text_splice = 1012,
    $array_create = 1030,
    $array_delete = 1031,
    $array_update = 1032,

    $schema_data_push = 1040,
    $schema_data_remove = 1041,
    $schema_data_update = 1042,
   


    $change_cursor_offset = 1055,
    $page_turn_layout = 1060,
    $page_update_prop = 1061,

    $data_grid_trun_view=1070,

    //#endregion


}

