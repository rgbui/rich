/// <reference types="react" />
import { Events } from "../util/events";
import { Point, Rect } from "../common/point";
import { Page } from "../page";
import { Anchor } from "../selector/selection/anchor";
import { BlockAppear, BlockDisplay, BlockRenderRange } from "./base/enum";
import { Pattern } from "./pattern/index";
import { BaseComponent } from "./base/component";
import { Block$Seek } from "./seek";
import { BlockSelection } from "../selector/selection/selection";
export declare abstract class Block extends Events {
    parent: Block;
    url: string;
    page: Page;
    id: string;
    date: number;
    pattern: Pattern;
    blocks: Record<string, Block[]>;
    private __props;
    get childs(): Block[];
    get allChilds(): Block[];
    get patternState(): string;
    get hasChilds(): boolean;
    get parentBlocks(): Block[];
    get parentKey(): string;
    get blockKeys(): string[];
    get at(): number;
    get prev(): Block;
    get next(): Block;
    constructor(page: Page);
    init(): void;
    /**
     * 当前元素内部第一个坑位元素
     */
    get firstPitBlock(): Block;
    /**
     * 当前元素内部最后一个坑位元素
     */
    get lastPitBlock(): Block;
    remove(): void;
    /***
     * 彻底的删除元素
     */
    delete(): Promise<void>;
    /***
     * 移出元素，如果元素本身是布局的元素，那么此时的布局元结构是空的，那么可能会从里到外依次删除
     */
    deleteLayout(): Promise<void>;
    insertBefore(to: Block): void;
    insertAfter(to: Block): void;
    append(block: Block, at?: number, childKey?: string): void;
    updateProps(props: Record<string, any>, range?: BlockRenderRange): void;
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
    cloneData(): Promise<Block>;
    clone(): Promise<Block>;
    viewComponent: typeof BaseComponent | ((props: any) => JSX.Element);
    view: BaseComponent<this>;
    el: HTMLElement;
    get visibleStyle(): Record<string, any>;
    childsEl: HTMLElement;
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
    visibleDownCreateBlock(url: string, data?: Record<string, any>): Promise<Block>;
    content: string;
    get isEmpty(): boolean;
    get htmlContent(): string;
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
    private dragOverTime;
    private lastPoint;
    private overArrow;
    onDragOverStart(): void;
    onDragOver(point: Point): void;
    onDragLeave(): void;
    /***
     *用户输入
     */
    private inputTime;
    private currentLastInputText;
    /**
     * 用户一直输入内容,如果用户停留超过0.7秒，就记录
     */
    onInputText(from: number, text: string, force?: boolean, action?: () => Promise<void>): void;
    private deleteInputTime;
    private currentLastDeleteText;
    onInputDeleteText(from: number, text: string, force?: boolean, action?: () => Promise<void>): Promise<void>;
    onInputStart(): void;
    mounted(fn: () => void): void;
    onDelete(): Promise<void>;
    onUpdateProps(props: Record<string, any>, range?: BlockRenderRange): void;
    get isTextContent(): boolean;
    /**
     * 文本依据选区裂变创建新的block
     * 返回当前选区的block
     */
    onFissionCreateBlock(selection: BlockSelection): Promise<Block>;
}
export interface Block extends Block$Seek {
}
