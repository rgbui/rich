import { Kit } from "..";
import { Block } from "../../block";
import { KeyboardCode } from "../../common/keys";
import { TextCommand } from "../../extensions/text.tool/text.command";
import { ActionDirective } from "../../history/declare";
import { Events } from "../../util/events";
import { Anchor } from "./anchor";
export class SelectionExplorer extends Events {
    /**
     * 这个和选区有区别，选区只是争对单行的block进行文字进行操作
     * 这个是当前选择的block，最起码一个以上的
     */
    private selectedBlocks: Block[] = [];
    private start: Anchor;
    private end: Anchor;
    public kit: Kit;
    constructor(kit: Kit) {
        super();
        this.kit = kit;
    }
    get page() {
        return this.kit.page;
    }
    activeAnchor: Anchor;
    setActiveAnchor(anchor: Anchor) {
        if (anchor.isText) this.kit.textInput.onWillInput(anchor);
        if (this.activeAnchor !== anchor) {
            if (this.activeAnchor) this.page.onBlurAnchor(this.activeAnchor);
        }
        else return
        if (!this.activeAnchor.equal(anchor)) {
            this.activeAnchor = anchor;
            this.page.onFocusAnchor(this.activeAnchor);
        }
    }
    renderSelection() {
        if (this.start) this.start.visible()
        if (this.end) this.end.visible()
        if (this.start && this.end) {
            var range = document.createRange();
            range.setStartBefore(this.start.view);
            range.setEndAfter(this.end.view);
            if (range.collapsed) {
                range.setEndAfter(this.start.view);
                range.setStartBefore(this.end.view);
            }
            const selection = window.getSelection();
            if (selection.rangeCount > 0) selection.removeAllRanges(); // 将已经包含的已选择的对象清除掉
            selection.addRange(range); // 将要复制的区域的range对象添加到selection对象中
        }
        else {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) selection.removeAllRanges();
            var currentEls = Array.from(this.kit.page.el.querySelectorAll(".sy-block-selected"));
            this.selectedBlocks.each(sel => {
                currentEls.remove(sel.el);
                sel.el.classList.add('sy-block-selected');
            });
            currentEls.each(el => {
                el.classList.remove('sy-block-selected');
            })
        }
    }
    createAnchor() {
        return new Anchor(this);
    }
    onFocusAnchor(anchor: Anchor) {
        if (this.end) { this.end.dispose(); delete this.end; }
        if (this.start)
            anchor.acceptView(this.start);
        this.start = anchor;
        this.setActiveAnchor(this.start);
        this.selectedBlocks = [];
        this.renderSelection();
    }
    onShiftFocusAnchor(anchor: Anchor) {
        if (this.end) anchor.acceptView(this.end);
        this.end = anchor;
        this.setActiveAnchor(this.end);
        this.selectedBlocks = [];
        this.renderSelection();
    }
    onSelectBlocks(blocks: Block[]) {
        this.selectedBlocks = blocks;
        if (this.start)
            this.start.dispose()
        if (this.end)
            this.end.dispose()
        delete this.start;
        delete this.end;
        this.renderSelection()
    }
    /**
     * 取消选区
     */
    onCancelSelection() {

    }
    /**
     * 删除选区
     */
    onDeleteSelection() {

    }
    /**
     * 删除光标
     */
    onDeleteAnchor() {

    }
    /**
     * 光标移动
     * @param arrow 
     * @returns 
     */
    onCursorMove(arrow: KeyboardCode) {
        var anchor = this.activeAnchor;
        if (anchor) {
            var newAnchor: Anchor;
            if (anchor.isText) {
                if (arrow == KeyboardCode.ArrowLeft && !anchor.isStart) { anchor.at -= 1; anchor.visible(); return; }
                else if (arrow == KeyboardCode.ArrowLeft && anchor.isStart) newAnchor = anchor.block.visiblePrevAnchor;
                else if (arrow == KeyboardCode.ArrowRight && !anchor.isEnd) { anchor.at += 1; anchor.visible(); return; }
                else if (arrow == KeyboardCode.ArrowRight && anchor.isEnd)
                    newAnchor = anchor.block.visibleNextAnchor;
                else if (arrow == KeyboardCode.ArrowDown)
                    newAnchor = anchor.block.visibleInnerDownAnchor(anchor);
                else if (arrow == KeyboardCode.ArrowUp)
                    newAnchor = anchor.block.visibleInnerUpAnchor(anchor);
            }
            else if (anchor.isSolid) {
                if (arrow == KeyboardCode.ArrowLeft) {
                    newAnchor = anchor.block.visiblePrevAnchor;
                }
                else if (arrow == KeyboardCode.ArrowRight) {
                    newAnchor = anchor.block.visibleNextAnchor;
                    console.log(newAnchor);
                }
                else if (arrow == KeyboardCode.ArrowDown) {
                    newAnchor = anchor.block.visibleDownAnchor(anchor);
                }
                else if (arrow == KeyboardCode.ArrowUp) {
                    newAnchor = anchor.block.visibleUpAnchor(anchor);
                }
            }
            if (newAnchor) {
                /***
                 * 挨的比较近的两个文标签，光标移动时，需要多向前或向后移一位，
                 * 这样就不会在视觉上发现光标在某个地方有停留了
                 */
                if (anchor.isText && newAnchor.isText && (arrow == KeyboardCode.ArrowLeft || arrow == KeyboardCode.ArrowRight)) {
                    var ob = anchor.textEl.getBoundingClientRect();
                    var nb = newAnchor.textEl.getBoundingClientRect();
                    if (arrow == KeyboardCode.ArrowRight) {
                        if (Math.abs(ob.left + ob.width - nb.left) < 10) {
                            newAnchor.at += 1;
                        }
                    }
                    else if (arrow == KeyboardCode.ArrowLeft) {
                        if (Math.abs(nb.left + nb.width - ob.left) < 10) {
                            newAnchor.at -= 1;
                        }
                    }
                }
                this.onFocusAnchor(newAnchor);
            }
        }
    }
    /**
     * 换行，有的创建block
     */
    onEnter() {

    }
    /**
     * 对选区执行一些文本上的命令
     * @param command 
     */
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
                // await this.selections.eachAsync(async sel => {
                //     var bs = sel.referenceBlocks;
                //     var newStart: Block, newEnd: Block;
                //     await bs.eachAsync(async b => {
                //         if (b.isText) {
                //             if (b == sel.start.block || b == sel.end.block) {
                //                 var selBlock = await b.onFissionCreateBlock(sel);
                //                 selBlock.pattern.setStyle(BlockCssName.font, {
                //                     ...style
                //                 });
                //                 if (b == sel.start.block && b == sel.end.block) {
                //                     newStart = selBlock;
                //                     newEnd = selBlock;
                //                 }
                //                 else if (b == sel.start.block) {
                //                     newStart = selBlock;
                //                 }
                //                 else if (b == sel.end.block) {
                //                     newEnd = selBlock;
                //                 }
                //             }
                //             else {
                //                 b.pattern.setStyle(BlockCssName.font, {
                //                     ...style
                //                 });
                //             }
                //         }
                //     });
                //     if (newStart && newEnd) {
                //         sel.dispose();
                //         var newStartAnchor = this.createAnchor();
                //         newStartAnchor.block = newStart;
                //         newStartAnchor.at = 0;
                //         var newEndAnchor = this.createAnchor();
                //         newEndAnchor.block = newEnd;
                //         newEndAnchor.at = newEnd.content.length;
                //         sel.start = newStartAnchor;
                //         sel.end = newEndAnchor;
                //     }
                // });
            }, () => {
                this.renderSelection();
            })
        })
    }
    /**
     * 获取选区选择的block
     * @returns 
     */
    getDragBlocks() {
        if (this.selectedBlocks.length > 0) return this.selectedBlocks.map(s => s);
        else {
            if (this.start && !this.end) return [this.start.block.closest(x => !x.isLine)]
            else if (this.start && this.end) {
                return this.page.searchBlocksBetweenAnchor(this.start, this.end);
            }
        }
    }
    get hasSelectionRange() {
        return this.start && this.end || this.selectedBlocks.length > 0
    }
    get hasTextRange() {
        return this.start && this.end && this.selectedBlocks.length == 0 && this.start.block.isText && this.end.block.isText
    }
    get isOnlyAnchor() {
        return this.start && !this.end;
    }
    /**
     * 选区失焦时做什么
     */
    blur() {
        var currentEls = Array.from(this.kit.page.el.querySelectorAll(".sy-block-selected"));
        currentEls.each(el => {
            el.classList.remove('sy-block-selected');
        });
    }
}