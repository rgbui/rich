


import { Block } from "../../block";
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
    constructor(explorer: SelectionExplorer) {
        this.explorer = explorer;
    }
    /**
     * 点击在某个block上面
     */
    block: Block;
    get el() {
        return this.block.el;
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
        return this.block.isText;
    }
    get isSolid() {
        return this.block.isSolid;
    }
    get textContent() {
        return TextEle.getTextContent(this.textEl)
    }
    get textEl() {
        return this.block.textEl;
    }
    get soldEl() {
        return this.block.soldEl;
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
            this._view.classList.add('sy-anchor-appear');
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
            dom(this.textEl).insertAnchor(this.at, this);
            var fontStyle = TextEle.getFontStyle(this.textEl);
            this.view.style.visibility = 'visible';
            this.view.style.backgroundColor = fontStyle.color;
            this.view.style.height = typeof fontStyle.lineHeight == 'number' ? fontStyle.lineHeight + 'px' : '20px';
            this.view.style.display = 'inline';
            if (this.textContent.length == 0) {
                this.textEl.classList.add('empty');
            }
            else {
                this.textEl.classList.remove('empty');
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
            this.view.classList.remove('sy-anchor-solid');
            this.view.classList.add('sy-anchor-text');
        }
        else if (this.isSolid) {
            var el = this.soldEl;
            if (!el.contains(this.view)) {
                el.appendChild(this.view);
            }
            this.view.style.visibility = 'visible';
            this.view.style.display = 'block';
            this.view.style.backgroundColor = 'transparent';
            this.view.style.height = 'auto';
            this.view.classList.remove('sy-anchor-text');
            this.view.classList.add('sy-anchor-solid');
        }
        else {
            throw new Error('anchor visible error...');
        }
        if (this.isActive) {
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
        if (this.textEl) {
            this.textEl.classList.add('empty');
        }
    }
    removeEmpty() {
        if (this.textEl) {
            this.textEl.classList.remove('empty');
        }
    }
    equal(anchor: Anchor) {
        if (!anchor) return false;
        if (this === anchor) return true;
        else if (this.block === anchor.block) {
            if (this.block.isText && anchor.block.isText) {
                if (this.at == anchor.at) return true;
            }
            else if (this.block.isSolid && anchor.block.isSolid) {
                return true;
            }
        }
        return false;
    }
}

