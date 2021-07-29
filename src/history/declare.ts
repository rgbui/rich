

export enum ActionDirective {
    onInputText,
    onDeleteText,
    onBatchDragBlocks,
    onDelete,
    onUndo,
    onRedo,
    onUpdateProps,
    onUpdatePattern,
    onBatchDeleteBlocks,
    onCreateBlockByEnter,
    onEnterCutOff,
    onBatchTurn,
    onDeleteSelection,
    onInputDetector,
    onSchemaCreateField,
    onTablestoreUpdateViewField
}

export enum OperatorDirective {
    /**
     * 更新文本
     */
    updateText,
    updateTextReplace,
    updateTextDelete,
    create,
    /**
     * 删除，你可以认为是彻底的删除了
     */
    delete,
    /**
     * 移除，可以认为是脱离了当前节点树
     */
    remove,
    /**
     * 更新属性
     */
    updateProp,
    append,
    /**
     * 数组属性发生变化
     */
    arrayPropInsert,
    arrayPropUpdate,
    arrayPropRemove,

    insertStyle,
    mergeStyle

}

