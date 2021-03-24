

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
    get textEl() {
        var el = this.el;
        if (!el.classList.contains('sy-appear-text')) {
            var c: HTMLElement = el.querySelector('.sy-appear-text');
            if (!c) throw new Error('not found appear text')
            else el = c;
        }
        return el;
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
            return this.part.appear == BlockAppear.text;
        }
        else return this.block.isText;
    }
    copy(anchor: Anchor) {
        ['point', 'textArea', 'block', 'part', 'at'].each(key => {
            if (key == 'point') this[key] = anchor.point.clone();
            else this[key] = anchor[key];
        })
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
        return TextEle.getContent(this.textEl);
    }
    private _view: HTMLElement;
    get view(): HTMLElement {
        if (typeof this._view == 'undefined') {
            this._view = document.createElement('span');
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
        if (this.isText) {
            if (typeof this.at != 'number') {
                throw 'the text anchor at is not found';
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
            if (this.isActive) {
                this._view.style.visibility = 'visible';
                var self = this;
                if (this.textVisibleCursorTimer) clearInterval(this.textVisibleCursorTimer);
                delete this.textVisibleCursorTimer;
                this.textVisibleCursorTimer = setInterval(function () {
                    self._view.style.visibility = self._view.style.visibility == 'visible' ? "hidden" : 'visible';
                }, 700)
            }
            else {
                this._view.style.visibility = 'hidden';
                if (this.textVisibleCursorTimer) clearInterval(this.textVisibleCursorTimer);
                delete this.textVisibleCursorTimer;
            }
            this.view.setAttribute('class', 'sy-anchor-text');
        }
        else {
            var el = this.el;
            if (!el.classList.contains('sy-appear-solid')) {
                var c: HTMLElement = el.querySelector('.sy-appear-solid');
                if (!c) throw new Error('not found appear solid')
                else el = c;
            }
            if (!el.contains(this.view)) {
                el.appendChild(this.view);
            }
            this.view.setAttribute('class', 'sy-anchor-solid');
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

