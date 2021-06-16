import { Kit } from "..";
import { Block } from "../../block";
import { BlockCssName } from "../../block/pattern/css";
import { KeyboardCode } from "../../common/keys";
import { Exception, ExceptionType } from "../../error/exception";
import { ActionDirective } from "../../history/declare";
import { Events } from "../../util/events";
import { Anchor } from "./anchor";
export class SelectionExplorer extends Events {
    /**
     * 这个和选区有区别，选区只是争对单行的block进行文字进行操作
     * 这个是当前选择的block，最起码一个以上的
     */
    private currentSelectedBlocks: Block[] = [];
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
        this.kit.textInput.onWillInput(anchor);
        if (this.activeAnchor !== anchor) {
            if (this.activeAnchor) this.page.onBlurAnchor(this.activeAnchor);
        }
        else return
        if (!(this.activeAnchor && this.activeAnchor.equal(anchor))) {
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
            this.currentSelectedBlocks.each(sel => {
                currentEls.remove(sel.el);
                sel.el.classList.add('sy-block-selected');
            });
            currentEls.each(el => {
                el.classList.remove('sy-block-selected');
            })
        }
    }
    createAnchor(block: Block, at?: number) {
        var anchor = new Anchor(this);
        if (typeof at == 'number') {
            if (at == -1) anchor.at = block.content.length;
            else anchor.at = at;
        }
        else if (block.isText) anchor.at = 0;

        return anchor;
    }
    onFocusAnchor(anchor: Anchor) {
        if (this.end) { this.end.dispose(); delete this.end; }
        if (this.start)
            anchor.acceptView(this.start);
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
     * 对选区执行一些样式
     */
    async onSelectionSetPattern(styles: Record<BlockCssName, Record<string, any>>) {
        if (!this.hasTextRange) throw new Exception(ExceptionType.notTextSelection)
        await this.page.onAction(ActionDirective.onUpdatePattern, async () => {
            var bs = this.selectedBlocks;
            var newStart: Block, newEnd: Block;
            await bs.eachAsync(async block => {
                var fissContent = this.page.fissionBlockBySelection(block, this.start, this.end);
                var pattern = await block.pattern.cloneData();
                var at = block.at;
                var pa = block.parent;
                var url = block.url;
                if (!block.isTextContent) {
                    at = -1;
                    pa = block;
                    url = '/text';
                }
                if (fissContent.before)
                    await (this.page.createBlock(url, { content: fissContent.before, pattern }, pa, (at += 1)))
                if (fissContent.current) {
                    var current = await (this.page.createBlock(url, { content: fissContent.current, pattern }, pa, (at += 1)));
                    current.pattern.setStyles(styles);
                    if (block == this.start.block) newStart = current;
                    else if (block == this.end.block) newEnd = current;
                }
                if (fissContent.after)
                    await (this.page.createBlock(url, { content: fissContent.after, pattern }, pa, (at += 1)))
            });
            if (newStart && newEnd) {
                var newStartAnchor = this.createAnchor(newStart);
                newStartAnchor.acceptView(this.start);
                this.start = newStartAnchor;
                var newEndAnchor = this.createAnchor(newEnd, -1);
                newEndAnchor.acceptView(this.end);
                this.end = newEndAnchor;
                this.page.onUpdated(async () => {
                    this.renderSelection();
                });
            }
        });
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
                return this.page.searchBlocksBetweenAnchor(this.start, this.end);
            }
        }
    }
    get hasSelectionRange() {
        return this.start && this.end || this.currentSelectedBlocks.length > 0
    }
    get hasTextRange() {
        return this.start && this.end && this.currentSelectedBlocks.length == 0 && this.start.block.isText && this.end.block.isText
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