export declare enum CssSelectorType {
    none = 0,
    class = 1,
    /**
     * 伪类
     */
    pseudo = 2,
    /**
     * 如果处于某个状态（某个block触发），
     * 此时的block呈现的样式状态
     */
    depended = 3
}
