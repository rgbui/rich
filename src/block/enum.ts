

export enum BlockDisplay {
    /**
     * 行内元素，类似于文字的这种
     * 不一定特指文本，可以如表情等这样的
     */
    inline,
    /**
     * 块元素，整个元素本身会自动充满当前行
     */
    block
}

export enum Locate {
    prev,
    next
}

export enum Align {
    left,
    right,
    center
}

export enum Valign {
    top,
    bottom,
    middle
}
export enum BlockRenderRange {
    none,
    self,
    parent,
}






export enum BlockDirective {
    delete,
    copy,
    trun,
    trunIntoPage,
    moveTo,
    link,
    comment,
    color,
    arrowDown,
    arrowUp,
    arrowLeft,
    arrowRight,
    filter,
    hide,
    fieldSettings
}