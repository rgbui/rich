

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
        else {
            return this.block.el;
        }
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
        return TextEle.getContent(this.el);
    }
    private _view: HTMLElement;
    get view(): HTMLElement {
        if (typeof this._view == 'undefined') {
            this._view = document.createElement('span');
            this._view.innerHTML = `<em></em>`
        }
        return this._view;
    }
    get isActive() {
        return this.block.page.activeAnchor === this;
    }
    /***
     * 光标显示
     */
    visible() {
        if (this.isText) {
            var el = this.el;
            var content = this.textContent;
            var pre = content.slice(0, this.at);
            var next = content.slice(this.at);
            if (this.el.contains(this.view)) {
                var cs = el.children;
                (cs[0] as HTMLSpanElement).innerHTML = TextEle.getHtml(pre);
                (cs[2] as HTMLSpanElement).innerHTML = TextEle.getHtml(next);
            }
            else {
                this.el.innerHTML = '';
                var sp1 = document.createElement('span');
                sp1.innerHTML = TextEle.getHtml(pre);
                this.el.appendChild(sp1);
                this.el.appendChild(this.view);
                var sp2 = document.createElement('span');
                sp2.innerHTML = TextEle.getHtml(next);
                this.el.appendChild(sp2)
            }
            if (this.isActive) {
                this._view.style.visibility = 'visible';
                var self = this;
                this.textVisibleCursorTimer = setInterval(function () {
                    self._view.style.visibility = self._view.style.visibility == 'visible' ? "hidden" : 'visible';
                }, 700)
            }
            else {
                this._view.style.visibility = 'hidden';
                if (this.textVisibleCursorTimer) clearTimeout(this.textVisibleCursorTimer);
                delete this.textVisibleCursorTimer;
            }
        }
    }
    private textVisibleCursorTimer;
}

