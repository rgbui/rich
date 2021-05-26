export declare enum ActionDirective {
    onInputText = 0,
    onInputDeleteText = 1,
    onMoveBlock = 2,
    onDelete = 3,
    onUndo = 4,
    onRedo = 5,
    onUpdateProps = 6,
    onUpdatePattern = 7
}
export declare enum OperatorDirective {
    /**
     * 更新文本
     */
    updateText = 0,
    updateTextReplace = 1,
    updateTextDelete = 2,
    create = 3,
    /**
     * 删除，你可以认为是彻底的删除了
     */
    delete = 4,
    /**
     * 移除，可以认为是脱离了当前节点树
     */
    remove = 5,
    /**
     * 更新属性
     */
    updateProp = 6,
    append = 7,
    /**
     * 数组属性发生变化
     */
    arrayPropInsert = 8,
    arrayPropUpdate = 9,
    arrayPropRemove = 10,
    insertStyle = 11,
    mergeStyle = 12
}
