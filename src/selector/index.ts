
import { Block } from "../block/base";
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
    /***
     * 选择器，用户点击，有拖动选择器的意图,这和用户直接点在page上还是有区别的
     * 这个拖动有可能是拖动选区的文字，拖动到别一个block中，
     * 也有可能是直接拖动block
     */
    mousedown(event: MouseEvent) {

        function mousemove(ev: MouseEvent) {

        }
        function mouseup(ev: MouseEvent) {
            try {

            }
            catch (e) {

            }
            finally {
                document.removeEventListener('mousemove', mousemove);
                document.removeEventListener('mouseup', mouseup);
            }
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
    onMouseLeave(event: MouseEvent) {

    }
    onMouseEnter(event: MouseEvent) {

    }
    activeAnchor: Anchor;
    overBlock: Block;
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

    }
    onKeyDelete() {

    }
    onKeyInput(value: string) {

    }
    /***
     * 取消选区，比如失焦
     */
    onCancelSelection() {

    }
    onCreateBlockByEnter() {

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
    renderSelection() {
        if (this.isOnlyOneAnchor) {
            this.activeAnchor.visible()
        }
    }
    createAnchor() {
        return new Anchor(this);
    }
}

