import { Block } from "../block/base";
import { Point } from "../common/point";
import { Page } from "../page";
import { Anchor } from "./anchor";
import { SelectorView } from "./render/render";
import { BlockSelection } from "./selection";
export declare class Selector {
    selections: BlockSelection[];
    page: Page;
    constructor(page: Page);
    activeAnchor: Anchor;
    overBlock: Block;
    isDrag: boolean;
    setActiveAnchor(anchor: Anchor): void;
    get hasSelectionRange(): boolean;
    get isOnlyOneAnchor(): boolean;
    onKeyArrow(arrow: "ArrowLeft" | 'ArrowDown' | 'ArrowUp' | 'ArrowRight'): void;
    onKeyDelete(): void;
    /***
     * 取消选区，比如失焦
     */
    onCancelSelection(): void;
    onCreateBlockByEnter(): void;
    setOverBlock(overBlock: Block, event: MouseEvent): void;
    onMoveBlock(block: Block, to: Block, arrow: 'left' | 'right' | 'down' | 'up'): Promise<void>;
    /**
     * 捕获聚焦
     * 光标中的textarea在鼠标点击在别处mousedown时，会失焦
     * 所以在点击mouseup时，需要重新聚焦
     */
    onTextInputCaptureFocus(): void;
    view: SelectorView;
    createSelection(): BlockSelection;
    replaceSelection(anchor: Anchor): void;
    joinSelection(anchor: Anchor): void;
    renderSelection(): void;
    createAnchor(): Anchor;
    relativePageOffset(point: Point): Point;
    openMenu(): void;
}
