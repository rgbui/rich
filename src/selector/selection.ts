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
}