import { BaseBlock } from "./base";
import { Align } from "../common.enum";
import { BlockComposition } from "./composition/block";
/***
 * 内容型的block
 */
export class Content extends BlockComposition {
    /***
     * 是否是行block,就是独占一行
     */
    display: 'inline' | 'inline-block';
    /***
     * 指内容的摆放位置
     */
    align: Align;
}

