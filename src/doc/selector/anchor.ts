import { BaseBlock } from "../block/base";


export class Anchor {
    /***
     * 点击的原始鼠标位置
     */
    originMouseEvent: MouseEvent;
    /**
     * 点击在某个block上面
     */
    block: BaseBlock;
    /**
     * 就是block上面的某个部位名称
     * 可能争对某个部位有一些操作吧
     */
    part?: string;
    /**
     * 如果block是文字，则表示点在当前block文字中的某个位置上
     * 位置从0开始，以文字的长度结束
     */
    at?: number;
}