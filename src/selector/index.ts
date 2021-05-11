
import { Block } from "../block";
import { BlockFactory } from "../block/factory/block.factory";
import { Point } from "../common/point";
import { ActionDirective } from "../history/declare";
import { Page } from "../page";
import { TextCommand } from "../plug/text.menu/text.command";
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
    dropBlock: Block;
    dropArrow: 'left' | 'right' | 'down' | 'up' | 'inner' | 'none';
    get isDrag() {
        return this.view.bar.isDrag;
    }
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
            var currentDropBlock = this.overBlock?.dropBlock;
            if (currentDropBlock != this.dropBlock && this.dropBlock) {
                this.dropBlock.onDragLeave();
            }
            if (currentDropBlock && this.view.bar.dragBlock.contains(currentDropBlock)) {
                this.dropBlock = null;
                return;
            }
            if (currentDropBlock) {
                /**
                 * 说明切换到新的dropBLock
                 */
                if (currentDropBlock != this.dropBlock) currentDropBlock.onDragOverStart();
                currentDropBlock.onDragOver(Point.from(event));
            }
            else { delete this.dropBlock; this.dropArrow = 'none'; }
        }
        else if (this.overBlock && this.overBlock.dragBlock && this.view.bar.isDown != true) {
            this.view.bar.onStart(this.overBlock.dragBlock);
        } else {
            var target = event.target as HTMLElement;
            if (this.view.bar.el.contains(target)) return;
            this.view.bar.hide();
        }
    }
    /**
     * 将一个block元素移到另一个block某个方位时
     * 移走时，会导致原来的元素（部分元素会自动删除）
     * 移到这里，会有可能创建新的元素，以满足当前的布局
     * @param block 
     * @param to 
     * @param arrow 
     */
    async onMoveBlock(block: Block, to: Block, arrow: 'left' | 'right' | 'down' | 'up') {
        var self = this;
        this.page.snapshoot.declare(ActionDirective.onMoveBlock);
        this.page.onRememberUpdate();
        var fromParent = block.parent;
        block.remove();
        async function moveComplted() {
            await fromParent.deleteLayout();
            self.page.snapshoot.store();
            self.page.onExcuteUpdate();
        }
        switch (arrow) {
            case 'down':
                if (to.parent.isRow && to.parent.childs.length > 1) {
                    /***
                     * row{block,block}
                     * 需要创建一个新的col
                     */
                    var col = await this.page.createBlock('/col', {
                        blocks: { childs: [{ url: '/row' }, { url: '/row' }] }
                    }, to.parent, to.parent.at + 1);
                    col.mounted(async () => {
                        self.page.onRememberUpdate();
                        col.childs.first().append(to);
                        col.childs.last().append(block);
                        await moveComplted();
                    });
                    self.page.onExcuteUpdate();
                }
                else if (to.parent.isRow && to.parent.childs.length == 1) {
                    /***
                     * row
                     * row
                     * 
                     */
                    var row = await this.page.createBlock('/row', {},
                        to.parent.parent,
                        to.parent.at + 1);
                    row.mounted(async () => {
                        self.page.onRememberUpdate();
                        row.append(block);
                        await moveComplted();
                    });
                    self.page.onExcuteUpdate();
                }
                break;
            case 'up':
                if (to.parent.isRow && to.parent.childs.length > 1) {
                    /***
                     * row{block,block}
                     * 需要创建一个新的col
                     */

                    var col = await this.page.createBlock('/col', {
                        blocks: { childs: [{ url: '/row' }, { url: '/row' }] }
                    }, to.parent, to.at);
                    col.mounted(async () => {
                        self.page.onRememberUpdate();
                        col.childs.first().append(block);
                        col.childs.last().append(to);
                        await moveComplted();
                    });
                    self.page.onExcuteUpdate();
                }
                else if (to.parent.isRow && to.parent.childs.length == 1) {
                    /***
                     * row
                     * row
                     * 
                     */
                    var row = await this.page.createBlock('/row', {},
                        to.parent.parent,
                        to.parent.at);
                    row.mounted(async () => {
                        self.page.onRememberUpdate();
                        row.append(block);
                        await moveComplted();
                    });
                    self.page.onExcuteUpdate();
                }
                break;
            case 'left':
                if (to.parent.isRow) {
                    block.insertBefore(to);
                    await moveComplted();
                }
                break;
            case 'right':
                if (to.parent.isRow) {
                    block.insertAfter(to);
                    await moveComplted();
                }
                break;
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
        this.page.selectorMenu.select = (item, ev) => {

        }
        this.page.selectorMenu.open(event);
    }
    onSelectionExcuteCommand(command: TextCommand) {
        console.log(command, this.selections);
        this.selections.each(sel => {

        })
    }
}
