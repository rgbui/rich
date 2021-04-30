
export enum CssSelectorType {
    none,
    class,
    /**
     * 伪类
     */
    pseudo,
    /**
     * 如果处于某个状态（某个block触发），
     * 此时的block呈现的样式状态
     */
    depended
}