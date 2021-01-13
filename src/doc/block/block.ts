import { BaseBlock } from "./base";
import { BlockComposition } from "./composition/block";
/***
 * 类容型的block
 */
export class Content extends BaseBlock {
    /***
     * 是否是行block,会自动点满当前行
     */
    isRowBlock: boolean;
    rowAlign: 'left' | 'center' | 'right';
    blockComposition: BlockComposition;
    /***
     * 内容型的block一般都有高度的
     */
    height: number;
}
/***
 * 文字型的block，
 * 注意该文字block里面含有子文字或其它的如图像block等
 */
export class Text extends BaseBlock {
    blockComposition: BlockComposition;
}
/**
 * 可以将相邻的block变成一个整体去操作，
 * 可以看成是contentBlock
 */
export class Group extends BaseBlock {
    blockComposition: BlockComposition;
}