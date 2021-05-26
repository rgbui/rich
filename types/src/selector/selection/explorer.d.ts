import { Selector } from "..";
import { Events } from "../../util/events";
import { Anchor } from "./anchor";
import { BlockSelection } from "./selection";
export declare class SelectionExplorer extends Events {
    selections: BlockSelection[];
    selector: Selector;
    constructor(selector: Selector);
    get page(): import("../../page").Page;
    activeAnchor: Anchor;
    setActiveAnchor(anchor: Anchor): void;
    get hasSelectionRange(): boolean;
    get isOnlyOneAnchor(): boolean;
    createSelection(): BlockSelection;
    replaceSelection(anchor: Anchor): void;
    joinSelection(anchor: Anchor): void;
    renderSelection(): void;
    createAnchor(): Anchor;
}
