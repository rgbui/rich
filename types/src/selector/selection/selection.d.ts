import { Selector } from "..";
import { Block } from "../../block";
import { SelectionExplorer } from "./explorer";
import { Anchor } from "./anchor";
/***
 * 选区
 * start和end并没有表示一定是前后的情况
 */
export declare class BlockSelection {
    get selector(): Selector;
    explorer: SelectionExplorer;
    constructor(explorer: SelectionExplorer);
    private _start;
    private _end;
    get start(): Anchor;
    get end(): Anchor;
    set start(value: Anchor);
    set end(value: Anchor);
    get isEmpty(): boolean;
    get isOnlyAnchor(): boolean;
    get onlyAnchor(): Anchor;
    get hasRange(): boolean;
    dispose(): void;
    visible(): void;
    get referenceBlocks(): Block[];
}
