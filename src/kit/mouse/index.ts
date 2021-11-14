import { Kit } from "..";
import { Block } from "../../block";
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
    public isDown: boolean = false;
    public isMove: boolean = false;
    public downEvent: MouseEvent;
    public downAnchor: Anchor;
    public moveEvent: MouseEvent;
    private lastMouseupDate: number;
    private lastMouseupEvent: MouseEvent;
    onMousedown(event: MouseEvent) {
        var block = this.page.getMouseTargetBlock(event);
        this.downEvent = event;
        this.isDown = true;
        if (block && block.exists(g => g.isSupportAnchor, true)) {
            var point = Point.from(event);
            var anchor = block.visibleAnchor(point);
            if (anchor && anchor.block.isAllowMouseAnchor(event)) {
                this.downAnchor = anchor;
                /**
                 * 如果用户按住shift键，那么选区从之前的anchor扩到现在的anchor
                 * 如果之前的anchor到现在的anchor均在同一个文字区域内，
                 * 那么 将按范围选择多个block
                 */
                if (this.page.keyboardPlate.isShift() && this.explorer.hasAnchor) {
                    if (this.downAnchor.isText && this.downAnchor.elementAppear === this.explorer.activeAnchor.elementAppear)
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
        /**
         * 如果没有downAnchor，那么有选区时，则取消选区
         */
        if (!this.downAnchor) this.explorer.onCancelSelection();
    }
    onMousemove(event: MouseEvent) {
        this.moveEvent = event;
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
                    var block = this.page.getMouseTargetBlock(event);
                    var hastTextRange: boolean = false;
                    if (block) {
                        var anchor = block.visibleAnchor(Point.from(event));
                        if (anchor && this.page.isInlineAnchor(anchor, this.downAnchor)) {
                            this.explorer.onShiftFocusAnchor(anchor);
                            hastTextRange = true;
                        }
                    }
                    if (!hastTextRange) {
                        var blocks = this.page.searchBlocksBetweenMouseRect(this.downEvent, event, { lineBlock: true });
                        if (Array.isArray(blocks) && blocks.length > 0) {
                            this.explorer.onSelectBlocks(blocks);
                        }
                    }
                }
            }
        }
        //判断当前的ele是否在bar自已本身内
        if (this.kit.handle.containsEl(ele)) return;
        var block: Block;
        if (this.page.el.contains(ele)) {
            block = this.page.getBlockInMouseRegion(event);
        }
        this.page.onHoverBlock(block);
    }
    async onMouseup(event: MouseEvent) {
        if (this.isDown) {
            if (this.isMove) {
                if (!this.downAnchor) this.selector.close();
                this.isMove = false;
            }
            delete this.downAnchor;
            delete this.downEvent;
            this.isDown = false;
            /**
             * 双击，直接选中当前块block选区
             */
            if (this.explorer.isOnlyAnchor && this.explorer.activeAnchor.isText && this.lastMouseupDate && Date.now() - this.lastMouseupDate < 700) {
                if (this.lastMouseupEvent && Point.from(this.lastMouseupEvent).nearBy(Point.from(event), 0)) {
                    var block = this.explorer.activeAnchor.block;
                    var contentRowBlock = block.closest(x => !x.isLine);
                    if (contentRowBlock)
                        this.explorer.onSelectBlocks([contentRowBlock]);
                }
            }
            this.lastMouseupEvent = event;
            this.lastMouseupDate = Date.now();
            if (this.explorer.isOnlyAnchor) this.kit.textInput.onFocus();
            if (this.explorer.hasTextRange) await this.explorer.onOpenTextTool(event);
        }
    }

}