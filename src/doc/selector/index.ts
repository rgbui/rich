import { BaseBlock } from "../block/base/base";
import { Page } from "../page";
import { Anchor } from "./anchor/anchor";
import { SelectorView } from "./render";
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

            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
    onKeydown(event: React.KeyboardEvent<HTMLTextAreaElement>) {

    }
    /**
     * 捕获聚焦
     * 光标中的textarea在鼠标点击在别处mousedown时，会失焦
     * 所以在点击mouseup时，需要重新聚焦
     */
    onCaptureFocus() {
        if (this.view) {
            if (this.view.textarea) {
                if (this.view.textarea !== document.activeElement) {
                    this.view.textarea.focus()
                }
            }
        }
    }
    /**
     * 获取选区中所包含的block
     * 1. 选中中所涉及到的文字选区block
     * 2. 一个选区构成一个矩形，与矩形有相交的block
     */
    get blocks(): BaseBlock[] {
        return [];
    }
    view: SelectorView;
    get cursorAnchor(): Anchor {
        var sel = this.selections.last();
        if (sel) {
            if (sel.end) return sel.end;
            else if (sel.start) return sel.start;
        }
        return undefined;
    }
}

