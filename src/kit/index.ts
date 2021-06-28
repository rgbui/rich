import { Block } from "../block";
import { Point } from "../common/point";
import { Page } from "../page";
import { Events } from "../util/events";
import { Bar } from "./handle";
import { DropDirection } from "./handle/direction";
import { TextInput } from "./input";
import { Anchor } from "./selection/anchor";
import { SelectionExplorer } from "./selection/explorer";
import { Selector } from "./selector";
import { KitView } from "./view";
import "./style.less";
export class Kit extends Events {
    page: Page;
    constructor(page: Page) {
        super();
        this.page = page;
        this.init();
    }
    init() {
        this.selector = new Selector(this);
        this.explorer = new SelectionExplorer(this);
        this.textInput = new TextInput(this);
        this.bar = new Bar(this);
    }
    textInput: TextInput;
    selector: Selector;
    explorer: SelectionExplorer;
    bar: Bar;
    private isDown: boolean = false;
    private isMove: boolean = false;
    private downEvent: MouseEvent;
    private downAnchor: Anchor;
    get isMousedown() {
        return this.isDown;
    }
    view: KitView;
    private lastMouseupDate: number;
    private lastMouseupEvent: MouseEvent;
    acceptMousedown(event: MouseEvent) {
        var block = this.page.getVisibleBlockByMouse(event);
        this.downEvent = event;
        this.isDown = true;
        if (block && !block.isLayout) {
            var anchor = block.visibleAnchor(Point.from(this.downEvent));
            if (anchor) {
                this.downAnchor = anchor;
                this.explorer.onFocusAnchor(this.downAnchor);
            }
        }
    }
    acceptMousemove(event: MouseEvent) {
        var ele = event.target as HTMLElement;
        if (this.isDown == true) {
            var downPoint = Point.from(this.downEvent);
            if (downPoint.remoteBy(Point.from(event), 5)) {
                this.isMove = true;
                if (!this.downAnchor)
                    this.selector.setStart(downPoint)
            }
            if (this.isMove == true) {
                if (!this.downAnchor) {
                    this.selector.setMove(Point.from(event));
                    var blocks = this.page.searchBlocksBetweenMouseRect(this.downEvent, event);
                    if (Array.isArray(blocks) && blocks.length > 0) {
                        this.explorer.onSelectBlocks(blocks);
                    }
                }
                else {
                    var block = this.page.getVisibleBlockByMouse(event);
                    if (block && !block.isLayout) {
                        var anchor = block.visibleAnchor(Point.from(event));
                        if (anchor && anchor.block.closest(x => !x.isLine) == this.downAnchor.block.closest(x => !x.isLine)) {
                            this.explorer.onShiftFocusAnchor(anchor);
                        }
                        else if (anchor) {
                            var blocks = this.page.searchBlocksBetweenMouseRect(this.downEvent, event);
                            if (Array.isArray(blocks) && blocks.length > 0) {
                                this.explorer.onSelectBlocks(blocks);
                            }
                        }
                    }
                }
            }
        }
        /**
         * 注意这个是鼠标移动，鼠标不一定是在当前的内容页上按下mosuedown的
         */
        var hoverBlock;
        if (this.page.el.contains(ele)) {
            var block = this.page.searchBlockByMouse(event);
            if (block && !block.isLayout) hoverBlock = block;
        }
        this.bar.onHoverBlock(hoverBlock, event);
    }
    acceptMouseup(event: MouseEvent) {
        if (this.isDown) {
            this.emit('mouseup', event);
            if (this.isMove) {
                if (!this.downAnchor) this.selector.close();
                this.isMove = false;
            }
            delete this.downAnchor;
            delete this.downEvent;
            this.isDown = false;
            if (this.explorer.isOnlyAnchor && this.explorer.activeAnchor.isText && this.lastMouseupDate && Date.now() - this.lastMouseupDate < 700) {
                if (this.lastMouseupEvent && Point.from(this.lastMouseupEvent).nearBy(Point.from(event), 0)) {
                    var block = this.explorer.activeAnchor.block;
                    var contentRowBlock = block.closest(x => !x.isLine);
                    this.explorer.onSelectBlocks([contentRowBlock]);
                }
            }
            this.lastMouseupEvent = event;
            this.lastMouseupDate = Date.now();
            if (this.explorer.isOnlyAnchor)
                this.textInput.onFocus();
        }
    }
}

export interface Kit {
    on(name: 'error', fn: (error: Error) => void);
    emit(name: 'error', error: Error);
    on(name: 'inputting', fn: (value: string, anchor: Anchor, options: { start?: number }) => void);
    emit(name: 'inputting', value: string, anchor: Anchor, options: { start?: number });
    on(name: 'keydown', fn: (event: KeyboardEvent) => boolean | void);
    emit(name: "keydown", event: KeyboardEvent): boolean | void;
    on(name: 'willInput', fn: () => void);
    emit(name: 'willInput');
    on(name: "mouseup", fn: (event: MouseEvent) => void);
    emit(name: 'mouseup', event: MouseEvent);
    on(name: "openMenu", fn: (blocks: Block[], event: MouseEvent) => void);
    emit(name: 'openMenu', blocks: Block[], event: MouseEvent)
    on(name: 'dragMoveBlocks', fn: (blocks: Block[], drop: Block, direction: DropDirection) => void);
    emit(name: "dragMoveBlocks", blocks: Block[], drop: Block, direction: DropDirection)
}