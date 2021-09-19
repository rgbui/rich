import { Kit } from "..";
import { TextContent } from "../../block/element/text";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { BlockCssName } from "../../block/pattern/css";
import { KeyboardCode } from "../../common/keys";
import { Point } from "../../common/point";
import { Exception, ExceptionType } from "../../error/exception";
import { ActionDirective } from "../../history/declare";
import { Events } from "../../../util/events";
import { Anchor } from "./anchor";
import { useTextTool } from "../../../extensions/text.tool";
import { SelectionExplorer$Events } from "./event";
import { Mix } from "../../../util/mix";
export class SelectionExplorer extends Events {
    /**
     * 这个和选区有区别，选区只是争对单行的block进行文字进行操作
     * 这个是当前选择的block，最起码一个以上的
     */
    private currentSelectedBlocks: Block[] = [];
    start: Anchor;
    end: Anchor;
    public kit: Kit;
    constructor(kit: Kit) {
        super();
        this.kit = kit;
        this.__init_mixs();
    }
    get page() {
        return this.kit.page;
    }
    activeAnchor: Anchor;
    setActiveAnchor(anchor: Anchor) {
        this.kit.textInput.onStartInput(anchor);
        var emptyEles = Array.from(this.page.view.el.querySelectorAll('.shy-text-empty'));
        emptyEles.each(el => {
            el.classList.remove('shy-text-empty');
        })
        if (this.activeAnchor !== anchor) {
            if (this.activeAnchor) {
                this.page.onBlurAnchor(this.activeAnchor);
            }
        }
        else return
        var oldActive = this.activeAnchor;
        this.activeAnchor = anchor;
        if (!(this.activeAnchor && this.activeAnchor.equal(oldActive))) {
            this.page.onFocusAnchor(this.activeAnchor);
        }
    }
    renderSelection() {
        if (this.start) this.start.visible()
        if (this.end) this.end.visible();
        if (!this.isOnlyAnchor) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) selection.removeAllRanges(); // 将已经包含的已选择的对象清除掉
            if (this.start && this.end) {
                var range = document.createRange();
                if (this.start.isBefore(this.end)) {
                    range.setStartBefore(this.start.view);
                    range.setEndAfter(this.end.view);
                }
                else {
                    range.setEndAfter(this.start.view);
                    range.setStartBefore(this.end.view);
                }
                selection.addRange(range); // 将要复制的区域的range对象添加到selection对象中
            }
            else {
                var currentEls = Array.from(this.kit.page.el.querySelectorAll(".shy-block-selected"));
                this.currentSelectedBlocks.each(sel => {
                    currentEls.remove(sel.el);
                    sel.el.classList.add('shy-block-selected');
                });
                currentEls.each(el => {
                    el.classList.remove('shy-block-selected');
                })
            }
        }
        else {
            var currentEls = Array.from(this.kit.page.el.querySelectorAll(".shy-block-selected"));
            currentEls.each(el => {
                el.classList.remove('shy-block-selected');
            });
            const selection = window.getSelection();
            if (selection.rangeCount > 1) selection.removeAllRanges(); // 将已经包含的已选择的对象清除掉
            else if (selection.rangeCount == 1) {
                var sel = selection.getRangeAt(0);
                if (!sel.collapsed) {
                    selection.removeAllRanges();
                }
            }
        }
    }
    createAnchor(block: Block, at?: number) {
        var anchor = new Anchor(this, block.firstElementAppear);
        if (typeof at == 'number' && anchor.isText) {
            if (at == -1) anchor.at = anchor.elementAppear.textContent.length;
            else anchor.at = at;
        }
        else if (anchor.isText && typeof at == 'undefined') {
            anchor.at = 0;
        }
        return anchor;
    }
    createBackAnchor(block: Block, at?: number) {
        var anchor = new Anchor(this, block.appearAnchors.last());
        if (typeof at == 'number' && anchor.isText) {
            if (at == -1) anchor.at = anchor.elementAppear.textContent.length;
            else anchor.at = at;
        }
        return anchor;
    }
    onFocusAnchor(anchor: Anchor) {
        if (this.end) { this.end.dispose(); delete this.end; }
        if (this.start) anchor.acceptView(this.start);
        this.start = anchor;
        this.setActiveAnchor(this.start);
        this.currentSelectedBlocks = [];
        this.renderSelection();
    }
    onShiftFocusAnchor(anchor: Anchor) {
        if (this.end) anchor.acceptView(this.end);
        this.end = anchor;
        this.setActiveAnchor(this.end);
        this.currentSelectedBlocks = [];
        this.renderSelection();
    }
    onSelectBlocks(blocks: Block[]) {
        this.currentSelectedBlocks = blocks;
        if (this.start) this.start.dispose()
        if (this.end) this.end.dispose()
        delete this.start;
        delete this.end;
        this.renderSelection()
    }
    /**
     * 取消选区
     */
    onCancelSelection() {
        if (this.currentSelectedBlocks.length > 0) {
            this.currentSelectedBlocks = [];
        }
        else {
            if (this.start && this.start != this.activeAnchor)
                this.start.dispose()
            if (this.end && this.end != this.activeAnchor)
                this.end.dispose()
        }
        this.renderSelection();
    }
    /**
     * 删除选区
     */
    async onDeleteSelection() {
        // await this.page.onAction(ActionDirective.onDeleteSelection, async () => {
        //     if (this.currentSelectedBlocks.length > 0) {
        //         await this.currentSelectedBlocks.eachAsync(async block => {
        //             await block.delete();
        //         });
        //         this.onCancelSelection();
        //     }
        //     else {
        //         var blocks = this.page.searchBlocksBetweenAnchor(this.start, this.end);
        //         await blocks.eachAsync(async block => {
        //             if (!block.isText) await block.delete();
        //             else if (block == this.start.block && block != this.end.block) {
        //                 if (this.start.isBefore(this.end)) {
        //                     this.page.onUpdated(async () => {
        //                         var newAnchor = this.createAnchor(this.start.block, this.start.at);
        //                         this.onFocusAnchor(newAnchor);
        //                     });
        //                 }
        //                 var content = this.start.isBefore(this.end) ? block.textContent.slice(0, this.start.at) : block.textContent.slice(this.start.at);
        //                 block.updateProps({ content }, BlockRenderRange.self);
        //             }
        //             else if (block == this.end.block && block != this.start.block) {
        //                 if (this.end.isBefore(this.start)) {
        //                     this.page.onUpdated(async () => {
        //                         var newAnchor = this.createAnchor(this.end.block, this.end.at);
        //                         this.onFocusAnchor(newAnchor);
        //                     });
        //                 }
        //                 var content = this.end.isBefore(this.start) ? block.textContent.slice(0, this.end.at) : block.textContent.slice(this.end.at);
        //                 block.updateProps({ content }, BlockRenderRange.self);
        //             }
        //             else if (block == this.end.block && block == this.start.block) {
        //                 var min = Math.min(this.start.at, this.end.at);
        //                 var max = Math.max(this.start.at, this.end.at);
        //                 var content = block.textContent.slice(0, min) + block.textContent.slice(max);
        //                 block.updateProps({ content }, BlockRenderRange.self);
        //                 this.page.onUpdated(async () => {
        //                     var newAnchor = this.createAnchor(block, min);
        //                     this.onFocusAnchor(newAnchor);
        //                 });
        //             }
        //             else {
        //                 await block.delete();
        //             }
        //         })
        //     }
        // })
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
                if (arrow == KeyboardCode.ArrowLeft && !anchor.isStart) {
                    anchor.at -= 1;
                    anchor.visible();
                    return;
                }
                else if (arrow == KeyboardCode.ArrowLeft && anchor.isStart) newAnchor = anchor.block.visiblePrevAnchor;
                else if (arrow == KeyboardCode.ArrowRight && !anchor.isEnd) {
                    anchor.at += 1;
                    anchor.visible();
                    return;
                }
                else if (arrow == KeyboardCode.ArrowRight && anchor.isEnd) {
                    newAnchor = anchor.block.visibleNextAnchor;
                }
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
                    if (arrow == KeyboardCode.ArrowRight) {
                        if (this.page.textAnchorIsAdjoin(anchor, newAnchor)) newAnchor.at += 1;
                    }
                    else {
                        if (this.page.textAnchorIsAdjoin(newAnchor, anchor)) newAnchor.at -= 1;
                    }
                }
                this.onFocusAnchor(newAnchor);
            }
        }
    }
    /**
     * 换行，有的创建block
     */
    async onEnter() {
        await this.page.onAction(ActionDirective.onCreateBlockByEnter, async () => {
            var block = this.activeAnchor.block;
            if (block.isLine) block = block.closest(g => !g.isLine);
            var url = block.isContinuouslyCreated ? block.url : BlockUrlConstant.TextSpan;
            var continuouslyProps = block.continuouslyProps;
            var newBlock = await block.visibleDownCreateBlock(url, { ...continuouslyProps });
            newBlock.mounted(() => {
                var anchor = newBlock.visibleHeadAnchor;
                this.onFocusAnchor(anchor);
            });
        })
    }
    async onEnterCutOff() {
        await this.page.onAction(ActionDirective.onCreateBlockByEnter, async () => {
            var anchor = this.activeAnchor;
            var pos = anchor.at;
            var block = anchor.block;
            var gs = block.nexts;
            var rest = anchor.elementAppear.textContent.slice(0, pos);
            var text = anchor.elementAppear.textContent.slice(pos);
            block.updateProps({ [anchor.elementAppear.prop]: rest });
            if (block.isLine) block = block.closest(g => !g.isLine);
            var url = block.isContinuouslyCreated ? block.url : BlockUrlConstant.TextSpan;
            var continuouslyProps = block.continuouslyProps;
            var newBlock: Block;
            if (gs.length > 0) {
                newBlock = await block.visibleDownCreateBlock(url, { ...continuouslyProps, childs: [{ url: BlockUrlConstant.Text, content: text }] });
                var tc = newBlock.find(g => g instanceof TextContent, true);
                for (let i = gs.length - 1; i >= 0; i--) {
                    let g = gs[i];
                    await g.insertAfter(tc);
                }
            }
            else {
                newBlock = await block.visibleDownCreateBlock(url, { ...continuouslyProps, content: text });
            }
            newBlock.mounted(() => {
                var anchor = newBlock.visibleHeadAnchor;
                this.onFocusAnchor(anchor);
            });
        })
    }
    /**
     * 对选区执行一些样式
     */
    async onSelectionSetPattern(styles: Record<BlockCssName, Record<string, any>>) {
        if (!this.hasTextRange) throw new Exception(ExceptionType.notTextSelection);
        await this.page.onAction(ActionDirective.onUpdatePattern, async () => {
            var bs = this.selectedBlocks;
            var newStart: Block, newEnd: Block;
            await bs.eachAsync(async block => {
                var fissContent = this.page.fissionBlockBySelection(block, this.start, this.end);
                if (!fissContent.after && !fissContent.before) {
                    /**
                     * 全选的操作
                     */
                    block.pattern.setStyles(styles);
                    return;
                }
                var pattern = await block.pattern.cloneData();
                var url = BlockUrlConstant.Text;
                if (block.isTextContent) {
                    var at = block.at;
                    var pa = block.parent;
                    /**
                     * 说明当前的block是textContent
                     */
                    if (fissContent.before) {
                        block.updateProps({ content: fissContent.before });
                        var current = await (this.page.createBlock(url, { content: fissContent.current, pattern }, pa, (at += 1)));
                        current.pattern.setStyles(styles);
                        if (block == this.start.block) newStart = current;
                        if (block == this.end.block) newEnd = current;
                        if (fissContent.after)
                            await (this.page.createBlock(url, { content: fissContent.after, pattern }, pa, (at += 1)))
                    }
                    else {
                        block.updateProps({ content: fissContent.current });
                        block.pattern.setStyles(styles);
                        if (block == this.start.block) newStart = block;
                        if (block == this.end.block) newEnd = block;
                        await (this.page.createBlock(url, { content: fissContent.after, pattern }, pa, (at += 1)))
                    }
                }
                else if (block.isLineSolid) {
                    /***
                     * 例如表情块
                     */
                    if (block == this.start.block) newStart = block;
                    if (block == this.end.block) newEnd = block;
                }
                else {
                    /**
                     * 说明当前的block是textspan
                     */
                    var at = -1;
                    var pa = block;
                    if (fissContent.before)
                        await (this.page.createBlock(url, { content: fissContent.before, pattern }, pa, (at += 1)))
                    if (fissContent.current) {
                        var current = await (this.page.createBlock(url, { content: fissContent.current, pattern }, pa, (at += 1)));
                        current.pattern.setStyles(styles);
                        if (block == this.start.block) newStart = current;
                        if (block == this.end.block) newEnd = current;
                    }
                    if (fissContent.after)
                        await (this.page.createBlock(url, { content: fissContent.after, pattern }, pa, (at += 1)))
                }
            });
            if (newStart && newEnd) {
                /**
                 * 这时的newStart
                 * newEnd是现创建的，
                 * 所以对光标的操作可能得在渲染之后才可以触发
                 */
                this.page.onUpdated(async () => {
                    var newStartAnchor = this.createAnchor(newStart);
                    newStartAnchor.acceptView(this.start);
                    this.start = newStartAnchor;
                    var newEndAnchor = this.createAnchor(newEnd, -1);
                    newEndAnchor.acceptView(this.end);
                    this.end = newEndAnchor;
                    this.renderSelection();
                });
            }
        });
    }
    async onOpenTextTool(event: MouseEvent) {
        var lineBlock = this.selectedBlocks.first().closest(x => !x.isLine)
        while (true) {
            var result = await useTextTool(this.getSelectionPoint(), {
                block: lineBlock,
                style: this.page.pickBlocksTextStyle(this.selectedBlocks)
            });
            if (result) {
                if (result.command == 'setStyle') {
                    await this.onSelectionSetPattern(result.styles);
                }
                else if (result.command == 'turn') {
                    await lineBlock.onClickContextMenu(result.item, result.event);
                    break;
                }
            }
            else break;
        }

    }
    /**
     * 获取选区选择的block
     * @returns 
     */
    get selectedBlocks() {
        if (this.currentSelectedBlocks.length > 0) return this.currentSelectedBlocks.map(s => s);
        else {
            if (this.start && !this.end) return [this.start.block.closest(x => !x.isLine)]
            else if (this.start && this.end) {
                var rs = this.page.searchBlocksBetweenAnchor(this.start, this.end);
                if (rs.length == 0) {
                    console.error(rs, this.start, this.end);
                }
                return rs;
            }
        }
        return [];
    }
    get hasSelectionRange() {
        return this.start && this.end || this.currentSelectedBlocks.length > 0
    }
    get hasTextRange() {
        return this.start && this.end && this.currentSelectedBlocks.length == 0 && this.page.isInlineAnchor(this.start, this.end)
    }
    get isOnlyAnchor() {
        return this.start && !this.end;
    }
    get hasAnchor() {
        return this.start ? true : false;
    }
    /**
     * 选区失焦时做什么
     */
    blur() {
        var currentEls = Array.from(this.kit.page.el.querySelectorAll(".shy-block-selected"));
        currentEls.each(el => {
            el.classList.remove('shy-block-selected');
        });
    }
    /**
     * 获取选区的起始位置
     */
    getSelectionPoint() {
        if (this.start.isBefore(this.end)) {
            return Point.from(this.start.view.getBoundingClientRect())
        }
        else return Point.from(this.end.view.getBoundingClientRect())
    }
}

export interface SelectionExplorer extends SelectionExplorer$Events {

}
export interface SelectionExplorer extends Mix {

}
Mix(SelectionExplorer, SelectionExplorer$Events)