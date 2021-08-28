import { Kit } from "..";
import { Point } from "../../common/point";
import { Anchor } from "../selection/anchor";
export class PageMouse {
    constructor(public kit: Kit) { }
    get page() {
        return this.kit.page;
    }
    get explorer() {
        return this.kit.explorer;
    }
    get selector() {
        return this.kit.selector;
    }
    private isDown: boolean = false;
    private isMove: boolean = false;
    private downEvent: MouseEvent;
    private downAnchor: Anchor;
    get isMousedown() {
        return this.isDown;
    }
    private lastMouseupDate: number;
    private lastMouseupEvent: MouseEvent;
    onMousedown(event: MouseEvent) {
        var block = this.page.getVisibleBlockByMouse(event);
        this.downEvent = event;
        this.isDown = true;
        if (block && block.isSupportAnchor) {
            var anchor = block.visibleAnchor(Point.from(this.downEvent));
            if (anchor) {
                this.downAnchor = anchor;
                if (this.page.keyboardPlate.isShift() && this.explorer.isOnlyAnchor) {
                    if (this.page.isInLineBlock(this.downAnchor.block, this.explorer.activeAnchor.block))
                        this.explorer.onShiftFocusAnchor(this.downAnchor);
                    else {
                        var blocks = this.page.searchBlocksBetweenAnchor(this.explorer.activeAnchor, this.downAnchor, { rowOrCol: true, lineBlock: true });
                        if (Array.isArray(blocks) && blocks.length > 0) {
                            this.explorer.onSelectBlocks(blocks);
                        }
                    }
                }
                else
                    this.explorer.onFocusAnchor(this.downAnchor);
            }
        }
        if (!this.downAnchor) this.explorer.onCancelSelection();
    }
    onMousemove(event: MouseEvent) {
        var ele = event.target as HTMLElement;
        if (this.isDown == true) {
            var downPoint = Point.from(this.downEvent);
            if (downPoint.remoteBy(Point.from(event), 5)) {
                this.isMove = true;
                if (!this.downAnchor) this.selector.setStart(downPoint)
            }
            if (this.isMove == true) {
                if (!this.downAnchor) {
                    this.selector.setMove(Point.from(event));
                    var blocks = this.page.searchBlocksBetweenMouseRect(this.downEvent, event, { lineBlock: true });
                    if (Array.isArray(blocks) && blocks.length > 0) {
                        this.explorer.onSelectBlocks(blocks);
                    }
                }
                else {
                    var block = this.page.getVisibleBlockByMouse(event);
                    if (block && !block.isLayout) {
                        var anchor = block.visibleAnchor(Point.from(event));
                        if (anchor) {
                            if (this.page.isInLineBlock(this.downAnchor.block, anchor.block)) {
                                this.explorer.onShiftFocusAnchor(anchor);
                            }
                            else {
                                var blocks = this.page.searchBlocksBetweenMouseRect(this.downEvent, event, { lineBlock: true });
                                if (Array.isArray(blocks) && blocks.length > 0) {
                                    this.explorer.onSelectBlocks(blocks);
                                }
                            }
                        }
                    }
                }
            }
        }
        //判断当前的ele是否在bar自已本身内
        if (this.kit.bar.barEle.contains(ele)) return;
        var hoverBlock;
        if (this.page.el.contains(ele)) {
            var block = this.page.searchBlockByMouse(event);
            if (block && !block.isRow && !block.isCol) hoverBlock = block;
        }
        this.kit.bar.onHoverBlock(hoverBlock, event);
    }
    onMouseup(event: MouseEvent) {
        if (this.isDown) {
            this.kit.emit('mouseup', event);
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
                this.kit.textInput.onFocus();
        }
    }
}