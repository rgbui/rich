import { Selector } from "..";
import { Block } from "../../block";
import { Rect } from "../../common/point";
import { SelectionExplorer } from "./explorer";
/***
 * 鼠标点击后产生的锚点
 * 该锚点只是表示点在什么地方
 * 可以是点在图像
 * 也可以是点文本的某个位置上面
 */
export declare class Anchor {
    get selector(): Selector;
    explorer: SelectionExplorer;
    constructor(explorer: SelectionExplorer);
    /**
     * 点击在某个block上面
     */
    block: Block;
    get el(): HTMLElement;
    at?: number;
    /***
     * 光标是否为于文字开始位置
     */
    get isStart(): boolean;
    /**
     * 光标是否为文字末尾
     */
    get isEnd(): boolean;
    get isText(): boolean;
    get isSolid(): boolean;
    get textContent(): string;
    get textEl(): HTMLElement;
    get soldEl(): HTMLElement;
    acceptView(anchor: Anchor): void;
    private _view;
    get view(): HTMLElement;
    get isActive(): boolean;
    get bound(): Rect;
    /***
     * 光标显示
     */
    visible(): void;
    private textVisibleCursorTimer;
    dispose(): void;
    setEmpty(): void;
    removeEmpty(): void;
}
