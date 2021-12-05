import { Kit } from "..";
import { Block } from "../../block";
import { dom } from "../../common/dom";
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
    private downStartBlock: Block;
    private downPoint: Point;
    public moveEvent: MouseEvent;
    private lastMouseupDate: number;
    private lastMouseupEvent: MouseEvent;
    onMousedown(event: MouseEvent) {
        this.clearTime();
        var block = this.downStartBlock = this.page.getBlockInMouseRegion(event);
        if (this.downStartBlock?.isLine) this.downStartBlock = this.downStartBlock.closest(x => x.isBlock);
        this.downEvent = event;
        this.downPoint = Point.from(event);
        this.isDown = true;
        this.selector.setStart(this.downPoint)
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
                    if (this.downAnchor.isText && this.page.isInlineAnchor(this.downAnchor, this.explorer.activeAnchor))
                        this.explorer.onShiftFocusAnchor(this.downAnchor);
                    else if (!this.downAnchor.equal(this.kit.explorer.activeAnchor)) {
                        var blocks = this.page.searchBlocksBetweenAnchor(this.explorer.activeAnchor, this.downAnchor, { rowOrCol: true, lineBlock: true });
                        if (Array.isArray(blocks) && blocks.length > 0) {
                            this.explorer.onSelectBlocks(blocks);
                        }
                        else this.explorer.onFocusAnchor(this.explorer.activeAnchor);
                    }
                    else this.explorer.onFocusAnchor(this.explorer.activeAnchor);
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
        this.clearTime();
        this.moveEvent = event;
        if (this.isDown == true) {
            if (this.downPoint.remoteBy(Point.from(event), 5)) this.isMove = true;
            if (this.isMove == true) {
                var movePoint = Point.from(event);
                var cacSelector = (dis: number) => {
                    var hasTextRange: boolean = false;
                    if (this.downAnchor) {
                        var block = this.page.getBlockFromPoint(movePoint);
                        if (block) {
                            var anchor = block.visibleAnchor(movePoint);
                            if (anchor && this.page.isInlineAnchor(anchor, this.downAnchor)) {
                                this.explorer.onShiftFocusAnchor(anchor);
                                hasTextRange = true;
                            }
                        }
                    }
                    if (!hasTextRange) {
                        this.downPoint.y -= dis;
                        this.selector.setStart(this.downPoint);
                        this.selector.setMove(movePoint);
                        var blocks = this.page.searchBlocksBetweenMouseRect(this.downPoint, movePoint, { fromBlock: this.downStartBlock, lineBlock: true });
                        if (Array.isArray(blocks) && blocks.length > 0) {
                            this.explorer.onSelectBlocks(blocks);
                        }
                        else this.explorer.onCancelSelection();
                    }
                    else this.selector.close();
                }
                this.scrollSelector(event, (fir, dis) => {
                    if (fir) cacSelector(0)
                    else if (fir == false && dis > 0) cacSelector(dis);
                })
            }
        }
        //判断当前的ele是否在bar自已本身内
        var ele = event.target as HTMLElement;
        if (this.kit.handle.containsEl(ele)) return;
        var block: Block;
        if (this.page.root.contains(ele)) {
            block = this.page.getBlockInMouseRegion(event);
        }
        this.page.onHoverBlock(block);
    }
    private scrollTime;
    private scrollSelector(event: MouseEvent, callbackScroll: (fir: boolean, dis: number) => void) {
        var fn = (fir: boolean) => {
            if (fir == true) return callbackScroll(fir, 0);
            var sr: number = 0;
            var dis = 30;
            var feelDis = 150;
            var minBottom = Math.abs(event.clientY - window.innerHeight);
            var scrollDiv: HTMLElement = dom(this.page.root).closest(x => { return dom(x as HTMLElement).style('overflowY') == 'auto' }) as any;
            if (scrollDiv && minBottom < feelDis) {
                var top = scrollDiv.scrollTop;
                var dr = top + dis > scrollDiv.scrollHeight - scrollDiv.clientHeight ? scrollDiv.scrollHeight - scrollDiv.clientHeight - top : dis
                scrollDiv.scrollTop = top + dr;
                sr += dr;
            }
            var minTop = Math.abs(event.clientY - scrollDiv.getBoundingClientRect().top);
            if (scrollDiv && minTop < feelDis) {
                var top = scrollDiv.scrollTop;
                var dr = top - dis > 0 ? dis : top;
                scrollDiv.scrollTop = top - dr;
                sr += 0 - dr;
            }
            callbackScroll(fir, sr);
        }
        fn(true);
        this.scrollTime = setInterval(function () {
            fn(false);
        }, 50);
    }
    private clearTime() {
        if (this.scrollTime) {
            clearInterval(this.scrollTime);
            this.scrollTime = null;
        }
    }
    async onMouseup(event: MouseEvent) {
        this.clearTime();
        if (this.isDown) {
            if (this.isMove) {
                this.selector.close();
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
                    var contentBlock = block.closest(x => !x.isLine);
                    if (contentBlock && contentBlock.exists(g => g.appearAnchors.some(s => s.isText)), true) {
                        this.explorer.onBlockTextRange(contentBlock);
                    }
                }
            }
            this.lastMouseupEvent = event;
            this.lastMouseupDate = Date.now();
            if (this.explorer.isOnlyAnchor) this.kit.textInput.onFocus();
            if (this.explorer.hasTextRange) await this.explorer.onOpenTextTool(event);
        }
    }
}