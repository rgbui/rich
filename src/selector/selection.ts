import { Anchor } from "./anchor/anchor";

/***
 * 选区
 * start和end并没有表示一定是前后的情况
 */
export class BlockSelection {
    start: Anchor;
    end: Anchor;
}