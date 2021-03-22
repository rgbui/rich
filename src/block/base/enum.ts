
export enum BlockAppear {
    /**
     * 呈现的是文字的模式
     */
    text,
    /**
     * 一个整体的,不可分割
     */
    solid,
    /**
     * 主要是用来布局
     */
    layout,
    none
}
export enum BlockDisplay {
    /**
     * 行内元素，类似于文字的这种
     */
    inline,
    /**
     * 块元素，整个元素本身会自动充满当前行
     */
    block,
    /**
     * 也是块元素，但如果不指定宽度，那么会自动充满行，
     * 指定了宽度，则按宽度计算
     */
    inlineBlock
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

export enum BlockState {
    none,
    hover,
    focus,
    placeholder,
    input,
    click,
    contextmenu,
    longPress,
    dblclick
}