import { BaseBlock } from "./base";
import { Align } from "./common.enum";
import { BlockComposition } from "./composition/block";
/***
 * 类容型的block
 */
export class Content extends BaseBlock {
    /***
     * 是否是行block,就是独占一行
     */
    isPerLine: boolean;
    /***
     * 指内容的摆放位置
     */
    align: Align;
    blockComposition: BlockComposition;
}
export class TextSpan extends Content {
    isPerLine = false;
    content: string;
}
/***
 * 文字型的block，
 * 注意该文字block里面含有子文字或其它的如图像block等
 */
export class TextContent extends BaseBlock {
    blockComposition: BlockComposition;
    content: string;
}
/**
 * 可以将相邻的block变成一个整体去操作，
 * 可以看成是contentBlock
 */
export class Group extends BaseBlock {
    blockComposition: BlockComposition;
}