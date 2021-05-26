export declare enum BlockAppear {
    /**
     * 呈现的是文字的模式
     */
    text = 0,
    /**
     * 一个整体的,不可分割
     */
    solid = 1,
    /**
     * 主要是用来布局
     */
    layout = 2,
    none = 3
}
export declare enum BlockDisplay {
    /**
     * 行内元素，类似于文字的这种
     */
    inline = 0,
    /**
     * 块元素，整个元素本身会自动充满当前行
     */
    block = 1,
    /**
     * 也是块元素，但如果不指定宽度，与block无异，
     * 指定了宽度，则按宽度计算，主要是一些表单元素，如输入框,设定了宽度后，不会自动在充满行，与block区别在于
     * 如果当前row中只有一个元素，如果该元素为block，那么会充满整行，而如果为inlineBlock，则会受宽度限制
     */
    inlineBlock = 2,
    /**
     * 行元素，总会是独占当前行
     */
    rowBlock = 3
}
export declare enum Locate {
    prev = 0,
    next = 1
}
export declare enum Align {
    left = 0,
    right = 1,
    center = 2
}
export declare enum Valign {
    top = 0,
    bottom = 1,
    middle = 2
}
export declare enum BlockRenderRange {
    none = 0,
    self = 1,
    parent = 2
}
