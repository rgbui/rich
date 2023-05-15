import lodash from "lodash";
import { Kit } from "..";
import { forceCloseTextTool } from "../../../extensions/text.tool";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { findBlockAppear, findBlocksBetweenAppears } from "../../block/appear/visible.seek";
import { BlockUrlConstant } from "../../block/constant";
import { TextContent } from "../../block/element/text";
import { BlockRenderRange } from "../../block/enum";
import { dom } from "../../common/dom";
import { TextEle } from "../../common/text.ele";
import { Point } from "../../common/vector/point";
import { OperatorDirective } from "../../history/declare";
import { AppearCursorPos, SnapshootBlockPos } from "../../history/snapshoot";
import { Selector } from "./selector";

export class AnchorCursor {
    selector: Selector;
    startAnchor: AppearAnchor;
    startOffset: number;
    endAnchor: AppearAnchor;
    endOffset: number;
    constructor(public kit: Kit) {
        this.selector = new Selector(this.kit);
    }
    get isCollapse() {
        if (!this.startAnchor) return false;
        if (!this.endAnchor) return false;
        if (this.currentSelectedBlocks.length > 0) return false;
        var sa = this.startAnchor.isEqual(this.endAnchor);
        if (sa) {
            if (this.startAnchor.isText) {
                if (this.startOffset == this.endOffset) return true;
            }
            else if (this.startAnchor.isSolid) {
                return true;
            }
        }
        return false;
    }
    get isAnchorAppear() {
        return this.startAnchor === this.endAnchor
    }
    onCatchWindowSelection() {
        this.kit.page.onAction('onCatchWindowSelection', async () => {
            this.catchWindowSelection()
        })
    }
    getWindowSelectionAnchors() {
        var sel = window.getSelection();
        var startAnchor = findBlockAppear(sel.anchorNode);
        var startOffset = startAnchor ? startAnchor.getCursorOffset(sel.anchorNode, sel.anchorOffset) : undefined;
        var endAnchor: AppearAnchor;
        var endOffset: number;
        if (sel.isCollapsed) {
            endAnchor = startAnchor;
            endOffset = startOffset;
        }
        else {
            endAnchor = findBlockAppear(sel.focusNode);
            endOffset = this.endAnchor.getCursorOffset(sel.focusNode, sel.focusOffset);
        }
        return {
            startAnchor,
            startOffset,
            endAnchor,
            endOffset
        }
    }
    catchWindowSelection() {
        var old = this.record;
        var sel = window.getSelection();
        this.startAnchor = findBlockAppear(sel.anchorNode);
        this.startOffset = this.startAnchor.getCursorOffset(sel.anchorNode, sel.anchorOffset);
        this.endAnchor = findBlockAppear(sel.focusNode);
        this.endOffset = this.endAnchor.getCursorOffset(sel.focusNode, sel.focusOffset);
        this.currentSelectedBlocks = [];
        this.kit.page.snapshoot.record(OperatorDirective.$change_cursor_offset, { old_value: old, new_value: this.record }, this.kit.page)
    }
    onCollapse(anchor: AppearAnchor, offset: number) {
        this.kit.page.onAction('onCollapse', async () => {
            this.collapse(anchor, offset)
        })
    }
    collapse(anchor: AppearAnchor, offset: number) {
        anchor.focus();
        var old = this.record;
        this.startAnchor = anchor;
        this.startOffset = offset;
        this.endAnchor = anchor;
        this.endOffset = offset;
        this.currentSelectedBlocks = [];
        this.renderSelectBlocks(this.currentSelectedBlocks);
        this.kit.page.snapshoot.record(OperatorDirective.$change_cursor_offset, { old_value: old, new_value: this.record }, this.kit.page)
    }
    /**
     * 设置文本的选区
     * @param options 
     * @param operators .merge 动作合并
     *                  .render  光标选区渲染
     *                  .combine 相同的行内块合并
     */
    onSetTextSelection(options: { startAnchor: AppearAnchor, startOffset: number, endAnchor: AppearAnchor, endOffset: number },
        operators?: { merge?: boolean, render?: boolean, combine?: boolean }) {
        if (!options.startAnchor?.el || !options.endAnchor?.el) return;
        this.kit.page.onAction('onSetTextSelection', async () => {
            if (operators?.merge) this.kit.page.snapshoot.merge();
            if (operators.combine) await this.combineBlockLines(options);
            this.setTextSelection(options)
            if (operators?.render) {
                this.kit.page.addUpdateEvent(async () => {
                    this.renderAnchorCursorSelection()
                })
            }
        })
    }
    /**
     * 合并子块,注意合并后，光标的位置会发生变化
     * @param options 
     */
    private async combineBlockLines(options: {
        startAnchor: AppearAnchor;
        startOffset: number;
        endAnchor: AppearAnchor;
        endOffset: number;
    }) {
        var appears = findBlocksBetweenAppears(options.startAnchor.el, options.endAnchor.el);
        var rowBlocks: Block[] = [];
        appears.forEach(ap => {
            var rb = ap.block.closest(g => g.isBlock);
            if (!rowBlocks.includes(rb)) rowBlocks.push(rb);
        });
        async function cb(rowBlock: Block) {
            var cs = rowBlock.childs;
            for (let i = cs.length - 1; i > 0; i--) {
                var line = cs[i];
                var prev = cs[i - 1];
                if (prev) {
                    if (line.url == BlockUrlConstant.Text && prev.url == BlockUrlConstant.Text) {
                        if ((line as TextContent).isEqualFormat(prev as TextContent)) {
                            if (line === options.startAnchor.block) {
                                options.startAnchor = prev.appearAnchors.first();
                                options.startOffset = prev.content.length + options.startOffset;
                            }
                            if (line === options.endAnchor.block) {
                                options.endAnchor = prev.appearAnchors.first();
                                options.endOffset = prev.content.length + options.endOffset;
                            }
                            await prev.updateProps({ content: prev.content + line.content }, BlockRenderRange.self);
                            await line.delete();
                        }
                    }
                    else if (line.url == BlockUrlConstant.KatexLine && prev.url == BlockUrlConstant.KatexLine) {
                        await prev.updateProps({ content: prev.content + line.content }, BlockRenderRange.self);
                        await line.delete();
                    }
                }
            }
        }
        async function er(rowBlocks: Block[]) {
            await rowBlocks.eachAsync(async rb => {
                if (rb.isBlock && rb.childs.some(s => s.isLine))
                    await cb(rb);
                if (Array.isArray(rb.subChilds))
                    await er(rb.subChilds)
            })
        }
        await er(rowBlocks);
    }
    setTextSelection(options: { startAnchor: AppearAnchor, startOffset: number, endAnchor: AppearAnchor, endOffset: number }) {
        var old = this.record;
        this.startAnchor = options.startAnchor;
        this.startOffset = options.startOffset;
        this.endAnchor = options.endAnchor;
        this.endOffset = options.endOffset;
        this.currentSelectedBlocks = [];
        this.kit.page.snapshoot.record(OperatorDirective.$change_cursor_offset, { old_value: old, new_value: this.record }, this.kit.page)
    }
    get record(): { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] } {
        return { start: this.startPos, end: this.endPos, blocks: this.currentSelectedBlocks.map(c => c.pos) }
    }
    get startPos() {
        if (this.startAnchor) {
            var pos = this.startAnchor.get();
            return {
                offset: this.startOffset,
                ...pos
            }
        }
        return null;
    }
    get endPos() {
        if (this.endAnchor) {
            var pos = this.endAnchor.get();
            return {
                offset: this.endOffset,
                ...pos
            }
        }
        return null;
    }
    /**
     * 获取选区内涉及到的编辑点
     * 包括文本编辑点，solid编辑点
     * @returns 
     */
    getAppears() {
        if (this.startAnchor?.el && this.endAnchor?.el)
            return findBlocksBetweenAppears(this.startAnchor.el, this.endAnchor.el);
        else return []
    }
    adjustAnchorSorts() {
        if (this.endAnchor === this.startAnchor && this.endOffset < this.startOffset || TextEle.isBefore(this.endAnchor.el, this.startAnchor.el)) {
            [this.startAnchor, this.endAnchor] = [this.endAnchor, this.startAnchor];
            [this.startOffset, this.endOffset] = [this.endOffset, this.startOffset];
        }
    }
    renderAnchorCursorSelection() {
        this.renderSelectBlocks(this.currentSelectedBlocks || [])
        if (this.currentSelectedBlocks.length == 0) {
            var sel = window.getSelection();
            if (!this.isCollapse) {
                if (this.startAnchor && this.endAnchor) {
                    var cr = this.startAnchor.cacCollapseFocusPos(this.startOffset);
                    var er = this.endAnchor.cacCollapseFocusPos(this.endOffset);
                    sel.setBaseAndExtent(cr.node, cr.pos, er.node, er.pos);
                    if (cr.node) {
                        var c = dom(cr.node).closest(g => (g as any) && typeof (g as any).scrollIntoViewIfNeeded == 'function') as any;
                        if (c) c.scrollIntoViewIfNeeded()
                    }
                    else {
                        console.log(this.startAnchor, cr.node, er.node, this.endAnchor);
                    }
                }
            }
            else {
                forceCloseTextTool()
                if (this.startAnchor.isSolid) {
                    this.startAnchor.collapse(this.startOffset)
                }
                else {
                    var cr = this.startAnchor.cacCollapseFocusPos(this.startOffset);
                    sel.collapse(cr.node, cr.pos);
                    if (cr.node) {
                        var c = dom(cr.node).closest(g => (g as any) && typeof (g as any).scrollIntoViewIfNeeded == 'function') as any;
                        if (c) c.scrollIntoViewIfNeeded()
                    }
                    else {
                        console.log(this.startAnchor, cr.node, this.endAnchor);
                    }
                }
            }
        }
        else {
            var sel = window.getSelection();
            if (sel) sel.removeAllRanges()
        }
    }
    /**
    * 这里指定将光标移到appearAnchor的最前面或者最后面
    */
    onFocusAppearAnchor(aa: AppearAnchor, options?: { render?: boolean, merge?: boolean, at?: number, last?: boolean | number, left?: number, y?: number }) {
        this.kit.page.onAction('onFocusAppearAnchor', async () => {
            if (options?.merge) this.kit.page.snapshoot.merge();
            this.focusAppearAnchor(aa, options)
            if (options?.render) {
                this.renderAnchorCursorSelection()
            }
        })
    }
    focusAppearAnchor(aa: AppearAnchor, options?: { at?: number, last?: boolean | number, left?: number, y?: number }) {
        var sel = window.getSelection();
        if (typeof options?.left == 'number') {
            var bounds = TextEle.getBounds(aa.el);
            var lineHeight = TextEle.getLineHeight(aa.el);
            var y = options?.last ? Math.min(bounds.last().bottom - lineHeight / 2, options.y) : Math.max(options.y, bounds.first().top + lineHeight / 2);
            aa.collapseByPoint(new Point(options.left, y))
            this.collapse(aa, sel.focusOffset);
        }
        else {
            var pos = 0;
            if (options?.last && aa.isText) pos = aa.textContent.length + (typeof options.last == 'number' ? options.last : 0);
            else if (options?.last && aa.isSolid) pos = 1;
            else pos = options?.at || 0;
            /**
             * 这里需要加个empty,
             * 因为重复点击某个位置，该光标会消失，原因未知
             */
            sel.empty();
            aa.collapse(pos);
            if (aa.isSolid) this.collapse(aa, pos)
            else this.collapse(aa, sel.focusOffset);
        }
    }
    /**
   * 
   * 将光标移到block中的某个appearAnchor中
   */
    onFocusBlockAnchor(block: Block, options?: { store?: boolean, merge?: boolean, render?: boolean, last?: boolean }) {
        this.kit.page.onAction('onFocusAppearAnchor', async () => {
            if (options?.merge) this.kit.page.snapshoot.merge();
            this.focusBlockAnchor(block, options)
            if (options?.render) {
                this.renderAnchorCursorSelection()
            }
        }, { disabledStore: options?.store === false ? true : undefined })
    }
    focusBlockAnchor(block: Block, options?: { render?: boolean, last?: boolean }) {
        var acs = block.appearAnchors;
        if (acs.length > 0) {
            if (options?.last) this.focusAppearAnchor(acs.last(), { last: true });
            else this.focusAppearAnchor(acs.first(), {});
        }
        else {
            if (options?.last) {
                var g = block.findReverse(g => g.appearAnchors.length > 0);
                if (g) this.focusAppearAnchor(g.appearAnchors.last(), { last: true })
                else {
                    var g = block.nextFind(g => g.appearAnchors.length > 0);
                    if (g) this.focusAppearAnchor(g.appearAnchors.first(), {});
                }
            }
            else {
                var g = block.find(g => g.appearAnchors.length > 0, true);
                if (g) this.focusAppearAnchor(g.appearAnchors.first(), {})
                else {
                    var g = block.prevFind(g => g.appearAnchors.length > 0);
                    if (g) this.focusAppearAnchor(g.appearAnchors.last(), { last: true });
                }
            }
        }
    }
    /***
    * 当前选择的块
    */
    currentSelectedBlocks: Block[] = []
    /***
     * 当前选择可操作的块
     */
    get currentSelectHandleBlocks(): Block[] {
        var ds: Block[] = [];
        var cs = this.currentSelectedBlocks.map(c => c.handleBlock);
        cs.each(c => { if (!ds.some(s => s == c)) ds.push(c) });
        return ds;
    }
    onSelectBlocks(blocks: Block[], options?: { merge?: boolean, render?: boolean }) {
        this.kit.page.onAction('onSelectBlocks', async () => {
            if (options?.merge) this.kit.page.snapshoot.merge();
            this.selectBlocks(blocks)
            if (options?.render) {
                this.renderAnchorCursorSelection()
            }
        })
    }
    onSelectAll() {
        var cs = this.kit.page.views[0].childs.map(c => c);
        lodash.remove(cs, c => c.url == BlockUrlConstant.Title)
        this.onSelectBlocks(cs, { render: true })
    }
    selectBlocks(blocks: Block[]) {
        var old = this.record;
        this.currentSelectedBlocks = blocks;
        this.kit.page.snapshoot.record(OperatorDirective.$change_cursor_offset, { old_value: old, new_value: this.record }, this.kit.page)
    }
    onClearSelectBlocks() {
        this.currentSelectedBlocks = [];
        this.renderSelectBlocks(this.currentSelectedBlocks);
    }
    renderSelectBlocks(blocks: Block[]) {
        var currentEls = Array.from(this.kit.page.root.querySelectorAll(".shy-block-selected"));
        blocks.each(sel => {
            var el = sel.addBlockSelect();
            currentEls.remove(el);
        });
        currentEls.each(el => {
            el.classList.remove('shy-block-selected');
        })
    }
}
