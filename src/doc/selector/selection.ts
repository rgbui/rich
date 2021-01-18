import { Anchor } from "./anchor";

/***
 * 选区
 * start和end并没有表示一定是前后的情况
 */
export class Selection {
    start: Anchor;
    end: Anchor;
}