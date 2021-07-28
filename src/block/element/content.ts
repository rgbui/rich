import { Align, BlockAppear, BlockDisplay } from "../enum";
import { BlockComposition } from "./composition/block";


/***
 * 内容型的block
 * 
 */
export class Content extends BlockComposition {
    /***
     * 指内容的摆放位置
     */
    align: Align;
    appear = BlockAppear.solid;
    display = BlockDisplay.block;
}

