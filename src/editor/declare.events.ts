import { Block } from "../block/block";
import { Cursor } from "../selector/cursor";

export interface Editor {

    /***
     * 鼠标点击编辑器
     */
    on(name: 'mousedown', fn: (cursor: Cursor) => void);
    /***
    * 鼠标点击编辑器
    */
    on(name: "mouseup", fn: (cursor: Cursor) => void);
    /**
     * 鼠标右键编辑器
     * @param name 
     * @param fn 
     */
    on(name: 'contextmenu', fn: (cursor: Cursor) => void);
    /**
     * 编辑器渲染后触发
     * @param name 
     * @param fn 
     */
    on(name: 'mounted', fn: () => void);
    /**
     * 渲染更新
     * @param name 
     * @param fn 
     */
    on(name: 'rendered', fn: () => void);
    /**
     * 编辑器失焦
     * @param name 
     * @param fn 
     */
    on(name: 'blur', fn: () => void);
    /**
     * 编辑器聚焦
     * @param name 
     * @param fn 
     */
    on(name: 'focus', fn: () => void);
    /**
     * 创建block
     * @param name 
     * @param fn 
     */
    on(name: 'createdBlocks', fn: (blocks: Block) => void);
    /***
     * 删出block
     */
    on(name: 'removeBlocks', fn: (blocks: Block) => void);
    /**
     * block渲染更新后触发一个事件,局新更新
     * @param name 
     * @param fn 
     */
    on(name: 'renderedBlock', fn: (block: Block) => void);
    /**
     * block渲染完成后触发
     * @param name 
     * @param fn 
     */
    on(name: 'blockMounted', fn: () => void);
    /**
     * 鼠标移入到block上面
     * @param name 
     * @param fn 
     */
    on(name: 'mouseenterBlock', fn: (from: Block, to: Block) => void);
    /**
     * 鼠标从block上面移出来
     * @param name 
     * @param fn 
     */
    on(name: 'mouseleaveBlock', fn: (from: Block, to: Block) => void);
    /**
     * 光标选中某个block时触发
     * @param name 
     * @param fn 
     * 
     */
    on(name: 'focusBlock', fn: (block: Block, cursor: Cursor) => void);
    /**
     * 光标失焦某个block时触发
     * @param name 
     * @param fn 
     */
    on(name: 'blockBlur', fn: (block: Block, cursor: Cursor) => void);
}
