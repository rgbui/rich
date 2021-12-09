import { Kit } from "..";
import { Block } from "../../block";
import { Point } from "../../common/point";
import { Events } from "../../../util/events";
import { Anchor } from "./anchor";
import { SelectionExplorer$Events } from "./event";
import { Mix } from "../../../util/mix";
export class SelectionExplorer extends Events {
    /**
     * 这个和选区有区别，选区只是争对单行的block进行文字进行操作
     * 这个是当前选择的block，最起码一个以上的
     */
    currentSelectedBlocks: Block[] = [];
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
        if (!(this.activeAnchor?.equal(anchor))) {
            if (this.activeAnchor) {
                this.page.onBlurAnchor(this.activeAnchor);
            }
        }
        else return
        this.activeAnchor = anchor;
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
                var currentEls = Array.from(this.kit.page.root.querySelectorAll(".shy-block-selected"));
                this.currentSelectedBlocks.each(sel => {
                    var el = sel.addBlockSelect();
                    currentEls.remove(el);
                });
                currentEls.each(el => {
                    el.classList.remove('shy-block-selected');
                })
            }
        }
        else {
            var currentEls = Array.from(this.kit.page.root.querySelectorAll(".shy-block-selected"));
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
    onFocusAnchor(anchor: Anchor) {
        if (!anchor) {
            this.onClearAnchorAndSelection();
        }
        else {
            if (this.end) { this.end.dispose(); delete this.end; }
            if (this.start) anchor.acceptView(this.start);
            this.start = anchor;
            this.setActiveAnchor(this.start);
            this.currentSelectedBlocks = [];
            this.renderSelection();
        }
    }
    onFocusBlockAtAnchor(block: Block, at?: number) {
        this.onFocusAnchor(block.createAnchor(at));
    }
    onShiftFocusAnchor(anchor: Anchor) {
        if (this.end) anchor.acceptView(this.end);
        this.end = anchor;
        this.setActiveAnchor(this.end);
        this.currentSelectedBlocks = [];
        this.renderSelection();
    }
    onBlockTextRange(block: Block) {
        var start = block.visibleHeadAnchor;
        var end = block.visibleBackAnchor;
        this.onSelectAnchors(start, end);
    }
    onSelectAnchors(start: Anchor, end: Anchor) {
        if (this.start) start.acceptView(this.start);
        if (this.end) end.acceptView(this.end);
        this.start = start;
        this.end = end;
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
                    // console.error(rs, this.start, this.end);
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
        return this.start && this.end && this.start.isText && this.end.isText && this.currentSelectedBlocks.length == 0 && this.page.isInlineAnchor(this.start, this.end)
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
export interface SelectionExplorer extends SelectionExplorer$Events { }
export interface SelectionExplorer extends Mix { }
Mix(SelectionExplorer, SelectionExplorer$Events)