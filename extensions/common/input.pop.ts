import React from "react";
import { Point, Rect, RectUtility } from "../../src/common/vector/point";
import { PopoverPosition } from "../../component/popover/position";
import { KeyboardCode } from "../../src/common/keys";
import { SearchListType } from "../../component/types";
import lodash from "lodash";
import ReactDOM from "react-dom";
import { Page } from "../../src/page";

export enum InputTextPopSelectorType {
    BlockSelector,
    AtSelector,
    LinkeSelector,
    UrlSelector,
    EmojiSelector,
    TagSelector,
}

export class InputTextPopSelector<T = any> extends React.Component {
    lazyTime = 700;
    loading = false;
    text: string = '';
    searchWord: string = '';
    continuousSearchEmpty: boolean = false;
    round: Rect = new Rect(0, 0, 0, 0);
    pos: Point = new Point(0, 0);
    el: HTMLElement;
    visible: boolean = false;
    selectIndex: number = 0;
    selectDeep: number = 0;
    prefix: string[] = [];
    list: T[] = [];
    allList: SearchListType<T> = { list: [], total: 0, page: 1, size: 500 };
    itemHoverSelector = '.item-hover-focus';
    _select: (...args: any[]) => void;
    page: Page;
    async open(round: Rect, text: string, callback: (...args: any[]) => void, page: Page) {
        this.page = page;
        if ((!text || text && this.prefix[0].length > 1 && this.prefix.map(c => c.slice(0, 1)).some(g => g == text)) && this.visible) {
            this.close()
            return this.visible
        }
        this._select = callback;
        this.round = round;
        this.pos = round.leftBottom;
        var newText = text;
        this.prefix.forEach(p => {
            newText = newText.replace(p, '');
        })
        this.text = newText;
        //判断当前的text是否不满足格式，结束下拦
        if (this.predictInput(this.text) == false) {
            this.close();
            return this.visible;
        }
        /**
        * 说明搜索了，为空，然后又输入了，就默认关闭
        */
        if (this.searchWord && this.text.startsWith(this.searchWord) && this.list.length == 0) {
            if (this.continuousSearchEmpty == true) {
                this.close();
                return this.visible;
            }
        }
        if (this.text) {
            this.visible = true;
            //说明要搜索
            if (this.lazyTime == 0) this.search()
            else this.syncSearch()
        }
        else {
            if (this.visible == false) {
                //说明要全查
                await this.searchAll()
            }
            this.visible = true;
            if (this.lazyTime == 0) this.search()
            else this.syncSearch()
        }
        return this.visible;
    }
    keydown(event: KeyboardEvent) {
        if (this.selectIndex == this.getListCount() - 1 + this.selectDeep) {
            this.selectIndex = 0;
        }
        else this.selectIndex += 1;
        this.forceUpdate()
        return true;
    }
    keyup(event: KeyboardEvent) {
        if (this.selectIndex == 0) {
            this.selectIndex = this.getListCount() - 1 + this.selectDeep;
        }
        else this.selectIndex -= 1;
        this.forceUpdate()
        return true;
    }
    keyleft(event: KeyboardEvent) {
        return true;
    }
    keyright(event: KeyboardEvent) {
        return true;
    }
    enter(event: KeyboardEvent) {
        var r = this.getSelectBlockData();
        if (r) return r;
        return false;
    }
    onSelect(item: T) {
        this._select(item);
        this.close()
    }
    onKeydown(event: KeyboardEvent): boolean | { blockData: Record<string, any> } {
        if (this.visible == true) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                    return this.keydown(event);
                case KeyboardCode.ArrowUp:
                    return this.keyup(event);
                case KeyboardCode.Enter:
                    var r = this.enter(event);
                    this.close();
                    return r;
                case KeyboardCode.ArrowLeft:
                    return this.keyleft(event);
                case KeyboardCode.ArrowRight:
                    return this.keyright(event);
            }
        }
        return false;
    }
    onClose(): void {
        this.close()
    }
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        document.addEventListener('mousedown', this.onGlobalMousedown);
    }
    componentDidUpdate() {
        if (this.el) {
            var el = this.el.querySelector(this.itemHoverSelector) as HTMLElement;
            if (el) {
                el.scrollIntoView({
                    block: "nearest",
                    inline: "nearest"
                });
            }
        }
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown);
    }
    onGlobalMousedown = (event: MouseEvent) => {
        if (this.visible == true && this.el) {
            var target = event.target as HTMLElement;
            if (this.el.contains(target)) return;
            this.close();
        }
    }
    getContentEl() {
        return this.el;
    }
    getListCount() {
        return this.list.length;
    }
    adjuctPosition() {
        this.forceUpdate(() => {
            var selectorEl = this.getContentEl();
            if (selectorEl) {
                var b = Rect.fromEle(selectorEl);
                var pos: PopoverPosition = {
                    roundArea: this.round,
                    elementArea: b
                }
                var newPoint = RectUtility.cacPopoverPosition(pos);
                if (!this.pos.equal(newPoint)) {
                    this.pos = newPoint;
                    this.forceUpdate();
                }
            }
        })
    }
    close() {
        this.continuousSearchEmpty = false;
        this.loading = false;
        this.text = '';
        this.searchWord = '';
        this.selectIndex = 0;
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
        }
    }
    predictInput(text: string) {
        //如果是空格，则认为结束下拉
        if (this.text.endsWith(' ')) {
            return false;
        }
        return true;
    }
    search = async () => {
        this.loading = true;
        this.searchWord = this.text;
        if (this.visible == false) return;
        this.adjuctPosition();
        this.list = await this.searchByWord(this.searchWord);
        if (this.list.length == 0) {
            this.continuousSearchEmpty = true;
        }
        else this.continuousSearchEmpty = false;
        if (this.selectIndex >= this.list.length) {
            this.selectIndex = 0;
        }
        this.loading = false;
        this.adjuctPosition();
    }
    syncSearch = lodash.debounce(async () => {
        await this.search();
    }, this.lazyTime)
    async searchAll() {

    }
    async searchByWord(word: string) {

        return [] as T[];
    }
    getSelectBlockData() {
        return null;
    }
}