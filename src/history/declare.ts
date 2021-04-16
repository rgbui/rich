

export enum ActionDirective {
    onEditText,
    onCreateBlock,
    onUndo,
    onRedo
}

export enum OperatorDirective {
    /**
     * 更新文本
     */
    updateText,
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
    append
}

