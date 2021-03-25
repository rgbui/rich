

import { Selector } from ".";
import { Block } from "../block/base";
import { BlockAppear } from "../block/base/enum";
import { BlockPart } from "../block/base/part";
import { Point } from "../common/point";
import { TextEle } from "../common/text.ele";
/***
 * 鼠标点击后产生的锚点
 * 该锚点只是表示点在什么地方
 * 可以是点在图像
 * 也可以是点文本的某个位置上面
 */
export class Anchor {
    selector: Selector;
    constructor(selector: Selector) {
        this.selector = selector;
    }
    /***
     * 光标位置,一般是指鼠标点击的位置，
     * 如果是文本，
     * 这会有一的定计算偏移，
     * 使其光标处于文字中间
     */
    point: Point;
    /**
     * 点击在某个block上面
     */
    block: Block;
    /**
     * 就是block上面的某个部位名称
     * 可能争对某个部位有一些操作吧
     */
    part?: BlockPart;
    get el() {
        if (this.part) return this.part.el;
        else return this.block.el;
    }
    at?: number;
    /***
     * 光标是否为于文字开始位置
     */
    get isStart() {
        return this.at == 0 ? true : false;
    }
    /**
     * 光标是否为文字末尾
     */
    get isEnd() {
        return this.at === this.textContent.length;
    }
    get isText() {
        if (this.part) {
            return this.part.isText;
        }
        else return this.block.isText;
    }
    get isSolid() {
        if (this.part) return this.part.isSolid;
        else return this.block.isSolid;
    }
    get() {
        return {
            at: this.at,
            block: this.block,
            el: this.el,
            point: this.point.get()
        }
    }
    get textContent() {
        return TextEle.getTextContent(this.textEl)
    }
    get textEl() {
        return this.part ? this.part.textEl : this.block.textEl;
    }
    get soldEl() {
        if (this.part) return this.part.soldEl;
        else return this.block.soldEl;
    }
    acceptView(anchor: Anchor) {
        this._view = anchor._view;
        if (anchor.textVisibleCursorTimer) { clearInterval(anchor.textVisibleCursorTimer); delete anchor.textVisibleCursorTimer; }
    }
    private _view: HTMLElement;
    get view(): HTMLElement {
        if (typeof this._view == 'undefined') {
            this._view = document.createElement('span');
            this.selector.view.el.appendChild(this._view);
            this._view.style.display = 'none';
            this._view.classList.add('sy-anchor-appear');
            this._view.innerHTML = `<span></span>`
        }
        return this._view;
    }
    get isActive() {
        return this.block.page.selector.activeAnchor === this;
    }
    /***
     * 光标显示
     */
    visible() {
        var self = this;
        if (this.textVisibleCursorTimer) clearInterval(this.textVisibleCursorTimer);
        delete this.textVisibleCursorTimer;
        if (this.isText) {
            if (typeof this.at != 'number') {
                throw 'the text anchor at is not null';
                return;
            }
            var el = this.textEl;
            var content = this.textContent;
            var pre = content.slice(0, this.at) || "";
            var next = content.slice(this.at) || "";
            if (el.contains(this.view)) {
                var cs = el.children;
                (cs[0] as HTMLSpanElement).innerHTML = TextEle.getHtml(pre);
                (cs[2] as HTMLSpanElement).innerHTML = TextEle.getHtml(next);
            }
            else {
                el.innerHTML = '';
                var sp1 = document.createElement('span');
                sp1.innerHTML = TextEle.getHtml(pre);
                el.appendChild(sp1);
                el.appendChild(this.view);
                var sp2 = document.createElement('span');
                sp2.innerHTML = TextEle.getHtml(next);
                el.appendChild(sp2)
            }
            this.view.style.display = 'inline';
            if (this.isActive) {
                this.view.style.visibility = 'visible';
                this.textVisibleCursorTimer = setInterval(function () {
                    self.view.style.visibility = self._view.style.visibility == 'visible' ? "hidden" : 'visible';
                }, 700)
            }
            else {
                this.view.style.visibility = 'hidden';
            }
            this.view.classList.remove('sy-anchor-solid');
            this.view.classList.add('sy-anchor-text');
        }
        else if (this.isSolid) {
            var el = this.soldEl;
            if (!el.contains(this.view)) {
                el.appendChild(this.view);
            }
            this.view.style.display = 'inline';
            this.view.classList.remove('sy-anchor-text');
            this.view.classList.add('sy-anchor-solid');
        }
        else {
            console.log(this.block);
            throw new Error('anchor visible error...');
        }
    }
    private textVisibleCursorTimer;
    dispose() {
        if (this._view) {
            this._view.remove();
        }
        if (this.textVisibleCursorTimer) {
            clearInterval(this.textVisibleCursorTimer);
            delete this.textVisibleCursorTimer;
        }
    }
}

