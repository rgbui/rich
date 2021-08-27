

export enum BlockDisplay {
    /**
     * 行内元素，类似于文字的这种
     * 不一定特指文本，可以如表情等这样的
     */
    inline,
    /**
     * 块元素，整个元素本身会自动充满当前行
     */
    block,
    /**
     * 也是块元素，但如果不指定宽度，与block无异，
     * 指定了宽度，则按宽度计算，主要是一些表单元素，如输入框,设定了宽度后，不会自动在充满行，与block区别在于
     * 如果当前row中只有一个元素，如果该元素为block，那么会充满整行，而如果为inlineBlock，则会受宽度限制
     */
    BlockInline,
    /**
     * 行元素，总会是独占当前行
     */
    rowBlock
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