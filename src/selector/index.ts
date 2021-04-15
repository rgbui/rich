
import { Block } from "../block/base";
import { BlockFactory } from "../block/factory/block.factory";
import { Point } from "../common/point";
import { Page } from "../page";
import { Anchor } from "./anchor";
import { SelectorView } from "./render/render";
import { BlockSelection } from "./selection";

export class Selector {
    selections: BlockSelection[] = [];
    page: Page;
    constructor(page: Page) {
        this.page = page;
    }
    activeAnchor: Anchor;
    overBlock: Block;
    isDrag: boolean = false;
    setActiveAnchor(anchor: Anchor) {
        this.activeAnchor = anchor;
        if (anchor.isText) {
            this.view.textInput.onStartInput(anchor);
        }
        this.page.emit('focusAnchor', this.activeAnchor);
        if (anchor != this.activeAnchor) {
            this.page.emit('changeAnchor', this.activeAnchor);
        }
    }
    get hasSelectionRange() {
        if (this.selections.length > 0) {
            return this.selections.exists(g => g.hasRange)
        }
        return false;
    }
    get isOnlyOneAnchor() {
        if (this.selections.length == 1) {
            return this.selections.trueForAll(g => g.isOnlyAnchor)
        }
        return false;
    }
    onKeyArrow(arrow: "ArrowLeft" | 'ArrowDown' | 'ArrowUp' | 'ArrowRight') {
        var anchor = this.activeAnchor;
        if (anchor) {
            var newAnchor: Anchor;
            if (anchor.isText) {
                if (arrow == 'ArrowLeft' && !anchor.isStart) { anchor.at -= 1; anchor.visible(); return; }
                else if (arrow == 'ArrowLeft' && anchor.isStart) newAnchor = anchor.block.visiblePrevAnchor;
                else if (arrow == 'ArrowRight' && !anchor.isEnd) { anchor.at += 1; anchor.visible(); return; }
                else if (arrow == 'ArrowRight' && anchor.isEnd)
                    newAnchor = anchor.block.visibleNextAnchor;
                else if (arrow == 'ArrowDown')
                    newAnchor = anchor.block.visibleInnerDownAnchor(anchor);
                else if (arrow == 'ArrowUp')
                    newAnchor = anchor.block.visibleInnerUpAnchor(anchor);
            }
            else if (anchor.isSolid) {
                if (arrow == 'ArrowLeft') {
                    newAnchor = anchor.block.visiblePrevAnchor;
                }
                else if (arrow == 'ArrowRight') {
                    newAnchor = anchor.block.visibleNextAnchor;
                    console.log(newAnchor);
                }
                else if (arrow == 'ArrowDown') {
                    newAnchor = anchor.block.visibleDownAnchor(anchor);
                }
                else if (arrow == 'ArrowUp') {
                    newAnchor = anchor.block.visibleUpAnchor(anchor);
                }
            }
            if (newAnchor) {
                /***
                 * 挨的比较近的两个文标签，光标移动时，需要多向前或向后移一位，
                 * 这样就不会在视觉上发现光标在某个地方有停留了
                 */
                if (anchor.isText && newAnchor.isText && (arrow == 'ArrowLeft' || arrow == 'ArrowRight')) {
                    var ob = anchor.textEl.getBoundingClientRect();
                    var nb = newAnchor.textEl.getBoundingClientRect();
                    if (arrow == 'ArrowRight') {
                        if (Math.abs(ob.left + ob.width - nb.left) < 10) {
                            newAnchor.at += 1;
                        }
                    }
                    else if (arrow == 'ArrowLeft') {
                        if (Math.abs(nb.left + nb.width - ob.left) < 10) {
                            newAnchor.at -= 1;
                        }
                    }
                }
                this.replaceSelection(newAnchor);
                this.setActiveAnchor(newAnchor);
                this.renderSelection();
            }
        }
    }
    onKeyDelete() {

    }
    /***
     * 取消选区，比如失焦
     */
    onCancelSelection() {

    }
    onCreateBlockByEnter() {

    }
    setOverBlock(overBlock: Block, event: MouseEvent) {
        var lastOverBlock = this.overBlock;
        if (lastOverBlock && lastOverBlock != overBlock) {
            this.page.emit('mouseleaveBlock', this.overBlock);
        }
        if (overBlock && lastOverBlock != overBlock) {
            this.overBlock = overBlock;
            this.page.emit('mouseenterBlock', this.overBlock);
        }
        else if (!overBlock)
            delete this.overBlock;

        if (this.isDrag == true) {
            this.view.bar.hide();
            if (lastOverBlock && lastOverBlock.dropBlock) lastOverBlock.dropBlock.onDragLeave();
            if (this.overBlock && this.view.bar.dragBlock.contains(this.overBlock)) {
                return;
            }
            if (this.overBlock && this.overBlock.dropBlock)
                this.overBlock.dropBlock.onDragOver(Point.from(event));
        }
        else if (this.overBlock && this.overBlock.dragBlock) {
            this.view.bar.onStart(this.overBlock.dragBlock);
        } else {
            var target = event.target as HTMLElement;
            if (this.view.bar.el.contains(target)) return;
            this.view.bar.hide();
        }
    }
    async onMoveBlock(block: Block, to: Block, arrow: 'left' | 'right' | 'down' | 'up') {
        var toRow = to.closest(x => x.isRow);
        var parentRow = block.closest(x => x.isRow);
        if (arrow == 'down') {
            if (parentRow.childs.length > 1) {
                parentRow = await BlockFactory.createBlock('/row', toRow.page, {}, toRow.parent);
                parentRow.append(block);
                parentRow.on('mounted', () => {
                    parentRow.insertAfter(toRow);
                })
                parentRow.parent.view.forceUpdate();
            }
            else parentRow.insertAfter(toRow);
        }
        else if (arrow == 'up') {
            if (parentRow.childs.length > 1) {
                parentRow = await BlockFactory.createBlock('/row', toRow.page, {}, toRow.parent);
                parentRow.append(block);
                parentRow.on('mounted', () => {
                    parentRow.insertBefore(toRow);
                })
                parentRow.parent.view.forceUpdate();
            }
            else parentRow.insertBefore(toRow);
        }
        else if (arrow == 'left') {
            console.log('to', to);
            block.insertBefore(to);
            if (parentRow.childs.length == 0) {
                parentRow.remove();
                parentRow.el.remove();
            }
        }
        else if (arrow == 'right') {
            block.insertAfter(to);
            if (parentRow.childs.length == 0) {
                parentRow.remove();
                parentRow.el.remove();
            }
        }
    }
    /**
     * 捕获聚焦
     * 光标中的textarea在鼠标点击在别处mousedown时，会失焦
     * 所以在点击mouseup时，需要重新聚焦
     */
    onTextInputCaptureFocus() {
        if (this.view && this.view.textInput) {
            this.view.textInput.onFocus();
        }
    }
    view: SelectorView;
    createSelection() {
        var sel = new BlockSelection(this);
        return sel;
    }
    replaceSelection(anchor: Anchor) {
        if (this.selections.length > 0) {
            this.selections.each((sel, i) => {
                if (i > 0) sel.dispose();
            });
            var sel = this.selections.first();
            if (sel.end) sel.end.dispose();
            if (sel.start) { anchor.acceptView(sel.start); sel.start = anchor; }
            this.selections = [sel];
        }
        else {
            var sel = this.createSelection();
            sel.start = anchor;
            this.selections = [sel];
        }
    }
    joinSelection(anchor: Anchor) {
        if (this.selections.length > 0) {
            var sel = this.selections.find(g => g.start == this.activeAnchor || g.end == this.activeAnchor);
            if (sel) {
                if (sel.end) { anchor.acceptView(sel.end); sel.end = anchor }
                else sel.end = anchor;
            }
        }
    }
    renderSelection() {
        this.selections.each(sel => {
            sel.visible();
        });
    }
    createAnchor() {
        return new Anchor(this);
    }
    relativePageOffset(point: Point) {
        var pe = this.page.el.getBoundingClientRect();
        return new Point(point.x - pe.left, point.y - pe.top);
    }
    openMenu(event: MouseEvent) {

    }
}

