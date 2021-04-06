/// <reference types="react" />
import { Events } from "../../util/events";
import { Point, Rect } from "../../common/point";
import { Page } from "../../page";
import { Anchor } from "../../selector/anchor";
import { BlockAppear, BlockDisplay } from "./enum";
import { BlockStyle } from "../style/index";
import { BaseComponent } from "./component";
export declare abstract class Block extends Events {
    parent: Block;
    url: string;
    page: Page;
    id: string;
    date: number;
    styles: BlockStyle[];
    blocks: Record<string, Block[]>;
    get childs(): Block[];
    blockChilds(name: string): Block[];
    get hasChilds(): boolean;
    private styleId;
    get style(): BlockStyle;
    get parentBlocks(): Block[];
    get parentKey(): string;
    get blockKeys(): string[];
    get at(): number;
    get prev(): Block;
    get next(): Block;
    constructor(page: Page);
    /***
     * 这是从里面最开始的查询
     */
    find(predict: (block: Block) => boolean, consider?: boolean): Block;
    findReverse(predict: (block: Block) => boolean, consider?: boolean): Block;
    /**
     * 当前元素内部第一个坑位元素
     */
    get firstPitBlock(): Block;
    /**
     * 当前元素内部最后一个坑位元素
     */
    get lastPitBlock(): Block;
    prevFind(predict: (block: Block) => boolean, consider?: boolean): Block;
    nextFind(predict: (block: Block) => boolean, consider?: boolean): Block;
    contains(block: Block, ignore?: boolean): boolean;
    findAll(predict: (block: Block) => boolean, consider?: boolean): Block[];
    closest(predict: (block: Block) => boolean, ignore?: boolean): Block;
    parents(predict: (block: Block) => boolean, ignore?: boolean): Block[];
    remove(): void;
    insertBefore(to: Block): void;
    insertAfter(to: Block): void;
    append(block: Block, at?: number): void;
    /***
    * 查找当前容器里面首位的内容元素，
    * 而且是视野上面的
    **/
    get visiblePitFirstContent(): Block;
    /**
     * 查换当前容器里面末尾的内容元素
     */
    get visiblePitLastContent(): Block;
    isLoad: boolean;
    load(data: any): Promise<void>;
    get(): Promise<Record<string, any>>;
    viewComponent: typeof BaseComponent | ((props: any) => JSX.Element);
    view: BaseComponent<this>;
    el: HTMLElement;
    setState(state: Record<string, any>): void;
    get visibleHeadAnchor(): Anchor;
    get visibleBackAnchor(): Anchor;
    get isText(): boolean;
    get isSolid(): boolean;
    protected display: BlockDisplay;
    protected appear: BlockAppear;
    /**
     * 布局用的block，该block只具有特定的调节布局效果，本身没有任何内容可以设置
     */
    get isLayout(): boolean;
    get isLine(): boolean;
    get isBlock(): boolean;
    /***
     * 注意换行的元素不一定非得是/row，
     * 如表格里面自定义的换行
     */
    get isRow(): boolean;
    get isCol(): boolean;
    get isArea(): boolean;
    partName: string;
    get isPart(): boolean;
    get partParent(): Block;
    get dragBlock(): Block;
    get dropBlock(): Block;
    get visiblePre(): Block;
    get visibleNext(): Block;
    get visiblePrevAnchor(): Anchor;
    get visibleNextAnchor(): Anchor;
    get row(): Block;
    get nextRow(): Block;
    get prevRow(): Block;
    visibleDownAnchor(anchor: Anchor): Anchor;
    visibleUpAnchor(anchor: Anchor): Anchor;
    visibleInnerDownAnchor(anchor: Anchor): Anchor;
    visibleInnerUpAnchor(anchor: Anchor): Anchor;
    /***
     * 通过坐标计算视野是处于block那个part中，或者block本身
     * 注意，当前的block有可能是layout block，那么需要通过坐标找到子视野的block，如果没有子block，这实际是个不可能出现的错误
     * 如果是一个isPanel的block，那么需要确认当前的坐标是否处于子的block中，别外注意，如果坐标是点在当前的空白block中，可能归宿到视野子内容
     * @param point 坐标（当前坐标明确是处于当前的block中）
     */
    visibleAnchor(point: Point): Anchor;
    visiblePoint(point: Point): Block;
    content: string;
    get htmlContent(): {
        __html: string;
    };
    updateContent(content: string, partName?: string): void;
    getBounds(): Rect[];
    getVisibleBound(): Rect;
    /**
     * 获取视觉上的block和part
     */
    get visibleBlock(): this[];
    get allVisibleBlocks(): Block[];
    get textEl(): HTMLElement;
    get soldEl(): HTMLElement;
    private dragTime;
    onDragOver(point: Point): void;
    onDragLeave(): void;
}
