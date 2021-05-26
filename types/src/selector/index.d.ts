import { Block } from "../block";
import { Point } from "../common/point";
import { Page } from "../page";
import { TextCommand } from "../extensions/text.tool/text.command";
import { SelectorView } from "./render/render";
import { SelectionExplorer } from "./selection/explorer";
export declare class Selector {
    page: Page;
    explorer: SelectionExplorer;
    constructor(page: Page);
    overBlock: Block;
    dropBlock: Block;
    dropArrow: 'left' | 'right' | 'down' | 'up' | 'inner' | 'none';
    get isDrag(): boolean;
    onKeyArrow(arrow: "ArrowLeft" | 'ArrowDown' | 'ArrowUp' | 'ArrowRight'): void;
    onKeyDelete(): void;
    /***
     * 取消选区，比如失焦
     */
    onCancelSelection(): void;
    onCreateBlockByEnter(): void;
    setOverBlock(overBlock: Block, event: MouseEvent): void;
    /**
     * 将一个block元素移到另一个block某个方位时
     * 移走时，会导致原来的元素（部分元素会自动删除）
     * 移到这里，会有可能创建新的元素，以满足当前的布局
     * @param block
     * @param to
     * @param arrow
     */
    onMoveBlock(block: Block, to: Block, arrow: 'left' | 'right' | 'down' | 'up'): Promise<void>;
    /**
     * 捕获聚焦
     * 光标中的textarea在鼠标点击在别处mousedown时，会失焦
     * 所以在点击mouseup时，需要重新聚焦
     */
    onTextInputCaptureFocus(): void;
    view: SelectorView;
    relativePageOffset(point: Point): Point;
    openMenu(event: MouseEvent): void;
    onSelectionExcuteCommand(command: TextCommand): Promise<void>;
}
