import { Block } from "../../..";
/***
 * 块布局
 */
export declare class BlockComposition extends Block {
    /**
     * 是否可以自由拖动
     */
    isFreeDrag: boolean;
    /**
     * 如果自由拖动，则自由拖动的位置，
     * 自由拖动后的块元素一般都会有明确的宽度
     */
    position: {
        x: number;
        y: number;
        width: number;
    };
    /**
     * 如果不是自由拖动的元素，则宽度则为百分比
     */
    widthPercent: number;
}
