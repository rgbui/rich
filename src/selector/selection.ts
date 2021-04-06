
import { Selector } from ".";
import { Anchor } from "./anchor";

/***
 * 选区
 * start和end并没有表示一定是前后的情况
 */
export class BlockSelection {
    selector: Selector;
    constructor(selector: Selector) {
        this.selector = selector;
    }
    private _start: Anchor;
    private _end: Anchor;
    get start(): Anchor { return this._start }
    get end(): Anchor { return this._end; }
    set start(value: Anchor) { this._start = value }
    set end(value: Anchor) { this._end = value; }
    get isEmpty() {
        return !this._start && !this._end;
    }
    get isOnlyAnchor() {
        if (typeof this._start != 'undefined' && typeof this._end != 'undefined') return false;
        if (this.isEmpty) return false;
        return true;
    }
    get onlyAnchor() {
        if (this._end) return this._end
        else if (this._start) return this._start;
        else return null;
    }
    get hasRange() {
        return !this.isEmpty && !this.isOnlyAnchor;
    }
    dispose() {
        if (this.start) this.start.dispose()
        if (this.end) this.end.dispose()
    }
    visible() {
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
        }
    }
}