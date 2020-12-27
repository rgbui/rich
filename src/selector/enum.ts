

/**
 * 选择器处于的选择状态
 * 
 */
export enum SelectorState {
    /**
     * 元素选择状态
     */
    box,
    /**
     * 光标输入状态
     */
    input,
    /**
     * 模拟输入状态，就是其实没有选中任何block，
     * 模拟一个临时的block，只有用户真正输入时，才输为input状态
     */
    analogInput
}