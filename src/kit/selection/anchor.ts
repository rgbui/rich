
import { AppearAnchor } from "../../block/appear";
import { dom } from "../../common/dom";
import { Rect } from "../../common/point";
import { TextEle } from "../../common/text.ele";
import { SelectionExplorer } from "./explorer";

/***
 * 鼠标点击后产生的锚点
 * 该锚点只是表示点在什么地方
 * 可以是点在图像
 * 也可以是点文本的某个位置上面
 */
export class Anchor {
    get kit() {
        return this.explorer.kit;
    }
    explorer: SelectionExplorer;
    constructor(explorer: SelectionExplorer, elementAppear: AppearAnchor) {
        this.explorer = explorer;
        this.elementAppear = elementAppear;
    }
    /**
     * 点击在某个block上面
     */
    get block() {
        return this.elementAppear.block;
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
    elementAppear: AppearAnchor;
    get isText() {
        return this.elementAppear.isText;
    }
    get isSolid() {
        return this.elementAppear.isSolid
    }
    get textContent() {
        return this.elementAppear.textContent
    }
    get el() {
        return this.elementAppear.el;
    }
    acceptView(anchor: Anchor) {
        this._view = anchor._view;
        if (anchor.textVisibleCursorTimer) {
            clearInterval(anchor.textVisibleCursorTimer);
            delete anchor.textVisibleCursorTimer;
        }
    }
    private _view: HTMLElement;
    get view(): HTMLElement {
        if (typeof this._view == 'undefined') {
            this._view = document.createElement('span');
            this._view.style.visibility = 'hidden';
            this._view.classList.add('shy-anchor-appear');
            this.kit.view.el.appendChild(this._view);
        }
        return this._view;
    }
    get isActive() {
        return this.explorer.activeAnchor === this;
    }
    get bound() {
        return Rect.from(this.view.getBoundingClientRect())
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
            dom(this.el).insertAnchor(this.at, this);
            var fontStyle = TextEle.getFontStyle(this.el);
            this.view.style.visibility = 'visible';
            this.view.style.backgroundColor = fontStyle.color;
            this.view.style.height = typeof fontStyle.lineHeight == 'number' ? fontStyle.lineHeight + 'px' : '20px';
            this.view.style.display = 'inline';
            if (this.textContent.length == 0) {
                this.el.classList.add('shy-text-empty');
            }
            else {
                this.el.classList.remove('shy-text-empty');
            }
            if (this.isActive) {
                this.view.style.visibility = 'visible';
                this.textVisibleCursorTimer = setInterval(function () {
                    if (self.isInputting == true) {
                        self.view.style.visibility = 'visible';
                        return;
                    }
                    self.view.style.visibility = self._view.style.visibility == 'visible' ? "hidden" : 'visible';
                }, 700)
            }
            else {
                this.view.style.visibility = 'hidden';
            }
            this.view.classList.remove('shy-anchor-solid');
            this.view.classList.add('shy-anchor-text');
        }
        else if (this.isSolid) {
            var el = this.el;
            if (!el.contains(this.view)) {
                el.appendChild(this.view);
            }
            this.view.style.visibility = 'visible';
            this.view.style.display = 'block';
            this.view.style.backgroundColor = 'rgba(46, 170, 220, 0.2)';
            this.view.style.height = 'auto';
            this.view.classList.remove('shy-anchor-text');
            this.view.classList.add('shy-anchor-solid');
            if (this.isActive) {
                this.textVisibleCursorTimer = setInterval(function () {
                    if (self.view.classList.contains('shy-anchor-active-hidden'))
                        self.view.classList.remove('shy-anchor-active-hidden');
                    else self.view.classList.add('shy-anchor-active-hidden');
                }, 700)
            }
        }
        else {
            throw new Error('anchor visible error...');
        }
        if (this.isActive) {
            /**
             * 向上感觉还可以，向下则挡住了，
             * 是不是考虑在光标内加个元素，比较长的
             */

            if (typeof (this.view as any).scrollIntoViewIfNeeded == 'function')
                (this.view as any).scrollIntoViewIfNeeded(true);
            else {
                this.view.scrollIntoView({
                    behavior: "smooth",
                    block: 'center',
                    inline: 'center'
                });
            }
            this.kit.textInput.followAnchor(this);
        }
    }
    /***
     * 表示当前的光标正在输入中，此时光标不能一直在闪
     */
    inputting() {
        this.isInputting = true;
        if (this.inputtingTime) {
            clearTimeout(this.inputtingTime);
            this.inputtingTime = null;
        }
        this.inputtingTime = setTimeout(() => {
            this.isInputting = false;
            this.inputtingTime = null;
        }, 1e3);
    }
    private isInputting: boolean = false;
    private inputtingTime;
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
    setEmpty() {
        if (this.isText) {
            this.el.classList.add('empty');
        }
    }
    removeEmpty() {
        if (this.isText) {
            this.el.classList.remove('empty');
        }
    }
    equal(anchor: Anchor) {
        if (!anchor) return false;
        if (this === anchor) return true;
        else if (this.elementAppear == anchor.elementAppear)
            return true;
        return false;
    }
    /**
     * 判断当前的anchor是否处在@param anchor 前面
     * 这里只能通过判断block的el，而不是anchor的view,
     * 因为anchor的view有可能不会显示，或者处于不在document中
     * @param anchor 
     */
    isBefore(anchor: Anchor) {
        if (this.el === anchor.el) {
            if (this.at <= anchor.at) return true;
        }
        var pos = this.el.compareDocumentPosition(anchor.el);
        if (pos == 4 || pos == 20) {
            return true
        }
        return false
    }
}

