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
     * 也是块元素，但如果不指定宽度，那么会自动充满行，
     * 指定了宽度，则按宽度计算
     */
    inlineBlock = 2
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
export declare enum BlockState {
    none = 0,
    hover = 1,
    focus = 2,
    placeholder = 3,
    input = 4,
    click = 5,
    contextmenu = 6,
    longPress = 7,
    dblclick = 8
}
