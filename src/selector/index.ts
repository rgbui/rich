
import { Block } from "../block";
import { BlockCssName } from "../block/pattern/css";
import { Point } from "../common/point";
import { ActionDirective } from "../history/declare";
import { Page } from "../page";
import { TextCommand } from "../extensions/text.tool/text.command";
import { Anchor } from "./selection/anchor";
import { SelectorView } from "./render/render";
import { BlockMenuAction } from "../extensions/menu/out.declare";
import { SelectionExplorer } from "./selection/explorer";

export class Selector {
    page: Page;
    explorer: SelectionExplorer;
    constructor(page: Page) {
        this.page = page;
        this.explorer = new SelectionExplorer(this);
    }
    overBlock: Block;
    dropBlock: Block;
    dropArrow: 'left' | 'right' | 'down' | 'up' | 'inner' | 'none';
    get isDrag() {
        return this.view.bar.isDrag;
    }
    onKeyArrow(arrow: "ArrowLeft" | 'ArrowDown' | 'ArrowUp' | 'ArrowRight') {
        var anchor = this.explorer.activeAnchor;
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
                this.explorer.onReplaceSelection(newAnchor);
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
    async onCreateBlockByEnter() {
        this.page.snapshoot.declare(ActionDirective.onCreateBlockByEnter);
        this.page.onRememberUpdate();
        var newBlock = await this.explorer.activeAnchor.block.visibleDownCreateBlock('/textspan');
        newBlock.mounted(() => {
            var contentBlock = newBlock.find(g => !g.isLayout);
            if (contentBlock) {
                var newAnchor = contentBlock.visibleHeadAnchor;
                this.explorer.onReplaceSelection(newAnchor);
            }
        });
        this.page.onExcuteUpdate();
        this.page.snapshoot.store();
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
            if (currentDropBlock && this.view.bar.dragBlock.exists(g => g.contains(currentDropBlock))) {
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
    relativePageOffset(point: Point) {
        var pe = this.page.el.getBoundingClientRect();
        return new Point(point.x - pe.left, point.y - pe.top);
    }
    openMenu(event: MouseEvent) {
        var dragBlock = this.view.bar.dragBlock.map(c => c);
        this.page.blockMenu.only('select', (item, ev) => {
            switch (item.name) {
                case BlockMenuAction.delete:
                    if (dragBlock.length > 0) {
                        this.page.onBatchDelete(dragBlock);
                    }
                    break;
                case BlockMenuAction.copy:
                    break;
                case BlockMenuAction.link:
                    break;
            }
        })
        this.page.blockMenu.open(event);
    }
    async onSelectionExcuteCommand(command: TextCommand) {
        await this.page.snapshoot.sync(ActionDirective.onUpdatePattern, async () => {
            await this.page.onObserveUpdate(async () => {
                var style: Record<string, any> = {};
                switch (command) {
                    case TextCommand.bold:
                        style.fontWeight = 'bold';
                        break;
                    case TextCommand.cancelBold:
                        style.fontWeight = 'normail';
                        break;
                    case TextCommand.italic:
                        style.fontStyle = 'italic';
                        break;
                    case TextCommand.cancelItalic:
                        style.fontStyle = 'normail';
                        break;
                    case TextCommand.deleteLine:
                        style.textDecoration = 'line-through';
                        break;
                    case TextCommand.underline:
                        style.textDecoration = 'underline';
                        break;
                    case TextCommand.cancelLine:
                        style.textDecoration = 'none';
                        break;
                }
                await this.explorer.selections.eachAsync(async sel => {
                    var bs = sel.referenceBlocks;
                    var newStart: Block, newEnd: Block;
                    await bs.eachAsync(async b => {
                        if (b.isText) {
                            if (b == sel.start.block || b == sel.end.block) {
                                var selBlock = await b.onFissionCreateBlock(sel);
                                selBlock.pattern.setStyle(BlockCssName.font, {
                                    ...style
                                });
                                if (b == sel.start.block && b == sel.end.block) {
                                    newStart = selBlock;
                                    newEnd = selBlock;
                                }
                                else if (b == sel.start.block) {
                                    newStart = selBlock;
                                }
                                else if (b == sel.end.block) {
                                    newEnd = selBlock;
                                }
                            }
                            else {
                                b.pattern.setStyle(BlockCssName.font, {
                                    ...style
                                });
                            }
                        }
                    });
                    if (newStart && newEnd) {
                        sel.dispose();
                        var newStartAnchor = this.explorer.createAnchor();
                        newStartAnchor.block = newStart;
                        newStartAnchor.at = 0;
                        var newEndAnchor = this.explorer.createAnchor();
                        newEndAnchor.block = newEnd;
                        newEndAnchor.at = newEnd.content.length;
                        sel.start = newStartAnchor;
                        sel.end = newEndAnchor;
                    }
                });
            }, () => {
                this.explorer.renderSelection();
            })
        })
    }
}
