import React from "react";
import ReactDOM from "react-dom";
import { Singleton } from "../../component/lib/Singleton";
import { KeyboardCode } from "../../src/common/keys";
import { Rect, Point } from "../../src/common/vector/point";
import { InputTextPopSelector } from "../common/input.pop";
import { Loading } from "../../component/view/loading";
import { EmojiCode, emojiStore, EmojiType } from "./store";
import { dom, domVisibleSeek } from "../../src/common/dom";
import { getEmoji } from "../../net/element.type";
import { Tip } from "../../component/view/tooltip/tip";
import { Spin } from "../../component/view/spin";
import lodash from "lodash";

/**
 * 用户输入::触发
 */
class EmojiSelector extends InputTextPopSelector {
    onClose(): void {
        this.close();
    }
    async open(
        round: Rect,
        text: string,
        callback: (...args: any[]) => void): Promise<boolean> {
        if (!text && this.visible) {
            this.close()
            return this.visible
        }
        this._select = callback;
        this.pos = round.leftBottom;
        this.visible = true;
        var t = text.replace(/^::|；；|;;|：：/, '');
        this.text = t;
        /**
        * 修复输入@+空格时，自动关掉搜索框
        */
        if (/[\S]+[\s]+$/g.test(this.text)) {
            this.close();
            return this.visible;
        }
        /**
         * 说明搜索了，为空，然后又输入了，就默认关闭
         */
        if (this.searchWord && this.text.startsWith(this.searchWord) && this.emojiCodes.length == 0) {
            if (this.continuousSearchEmpty == true) {
                this.close();
                return this.visible;
            }
            this.continuousSearchEmpty = true;
        }
        else if (!this.text) {
        }
        this.syncSearch();
        return this.visible;
    }
    emojiCodes: EmojiCode[] = [];
    emojis: EmojiType[] = [];
    loading = false;
    searchCode = '';
    searchWord = '';
    continuousSearchEmpty: boolean = false;
    syncSearch = lodash.debounce(async () => {
        this.loading = true;
        this.searchWord = this.text;
        this.forceUpdate();
        this.emojiCodes = [];
        this.emojis.forEach(ej => {
            ej.childs.forEach(c => {
                if (c.keywords.some(k => k == this.searchWord || k.indexOf(this.searchWord) > -1))
                    this.emojiCodes.push(c);
            })
        })
        if (!this.emojiCodes.some(s => s.code == this.searchCode)) {
            this.searchCode = this.emojiCodes.first()?.code;
        }
        this.loading = false;
        this.forceUpdate();
    }, 300)
    renderEmojis() {
        if (this.loading == true) return <div className='shy-emoji-view-loading'></div>
        var els: JSX.Element[] = [];
        var i = 0;
        this.emojis.forEach(category => {
            if (i > this.scrollIndex) return <div key={category.id}></div>;
            i += 1;
            els.push(<div className='shy-emoji-view-category' key={category.id}>
                <div className='shy-emoji-view-category-head'><span>{category.name}</span></div>
                <div className='shy-emoji-view-category-emojis'>{category.childs.map(emoji => {
                    return <Tip overlay={<>{emoji.name}</>} key={emoji.code}><span data-code={emoji.code} className={'ef ' + (this.searchCode == emoji.code ? "item-hover-focus" : "")} onMouseDown={e => this.onSelect(emoji)} dangerouslySetInnerHTML={{ __html: getEmoji(emoji.code) }}></span></Tip>
                })}</div>
            </div>)
        });
        if (this.scrollIndex > i) this.scrollOver = true;
        return els;
    }
    private renderSearchs() {
        return <div>
            {this.loading && <Spin block></Spin>}
            {!this.loading && this.emojiCodes.map((emoji, i) => {
                return <a onMouseDown={e => this.onSelect(emoji)} data-code={emoji.code} className={this.searchCode == emoji.code ? "item-hover-focus" : ""} key={emoji.code}>
                </a>
            })}
            {!this.loading && this.emojiCodes.length == 0 && this.searchWord && <div className="remark flex-center">没有搜索到</div>}
        </div>
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x
        }
        return <div>
            {this.visible && <div className='emoji-selectors' onScroll={e => this.onScroll(e)} style={style}>
                {!this.text && this.renderEmojis()}
                {this.text && this.renderSearchs()}
            </div>}
        </div>
    }
    private scrollIndex = 0;
    private scrollOver: boolean = false;
    private isScrollRendering: boolean = false;
    onScroll(event: React.UIEvent) {
        if (this.scrollOver == true) return;
        var dm = dom(event.target as HTMLElement);
        if (dm.isScrollBottom(100)) {
            if (this.isScrollRendering == true) return;
            this.scrollIndex += 1;
            this.isScrollRendering = true;
            this.forceUpdate(() => {
                this.isScrollRendering = false;
            })
        }
    }
    private onSelect(block: EmojiCode) {
        this._select({ url: '/emoji', isLine: true, src: { name: 'emoji', code: block.code } })
        this.close();
    }
    private visible: boolean = false;
    private pos: Point = new Point(0, 0)
    private _select: (block: Record<string, any>) => void;
    private text: string;
    private close() {
        this.searchCode = '';
        this.searchWord = '';
        this.loading = false;
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
        }
    }
    /**
     * 向下选择内容
     */
    private keydown() {
        var currentEl = this.el.querySelector(`[data-code="${this.searchCode}"]`);
        var rect = Rect.fromEle(currentEl as HTMLElement);
        var fg = domVisibleSeek({
            range: this.el,
            arrow: 'down',
            step: rect.width,
            point: rect.middleCenter,
            predict: (e) => {
                var dc = e.closest('[data-code]');
                if (dc) {
                    if (dc.getAttribute('data-code') != this.searchCode) {
                        return true;
                    }
                }
            }
        });
        if (fg) {
            var s = fg.closest('[data-code]') as HTMLElement;
            currentEl.classList.remove('item-hover-focus');
            s.classList.add('item-hover-focus');
            s.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            this.searchCode = s.getAttribute('data-code');
        }
    }
    /**
     * 向上选择内容
     */
    private keyup() {
        var currentEl = this.el.querySelector(`[data-code="${this.searchCode}"]`);
        var rect = Rect.fromEle(currentEl as HTMLElement);
        var fg = domVisibleSeek({
            range: this.el,
            arrow: 'up',
            step: rect.width,
            point: rect.middleCenter,
            predict: (e) => {
                var dc = e.closest('[data-code]');
                if (dc) {
                    if (dc.getAttribute('data-code') != this.searchCode) {
                        return true;
                    }
                }
            }
        });
        if (fg) {
            var s = fg.closest('[data-code]') as HTMLElement;
            currentEl.classList.remove('item-hover-focus');
            s.classList.add('item-hover-focus');
            s.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            this.searchCode = s.getAttribute('data-code');
        }
    }
    private keyleft() {
        var currentEl = this.el.querySelector(`[data-code="${this.searchCode}"]`);
        var rect = Rect.fromEle(currentEl as HTMLElement);
        var fg = domVisibleSeek({
            range: this.el,
            arrow: 'left',
            step: rect.width,
            point: rect.middleCenter,
            predict: (e) => {
                var dc = e.closest('[data-code]');
                if (dc) {
                    if (dc.getAttribute('data-code') != this.searchCode) {
                        return true;
                    }
                }
            }
        });
        if (fg) {
            var s = fg.closest('[data-code]') as HTMLElement;
            currentEl.classList.remove('item-hover-focus');
            s.classList.add('item-hover-focus');
            s.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            this.searchCode = s.getAttribute('data-code');
        }
    }
    private keyright() {
        var currentEl = this.el.querySelector(`[data-code="${this.searchCode}"]`);
        var rect = Rect.fromEle(currentEl as HTMLElement);
        var fg = domVisibleSeek({
            range: this.el,
            arrow: 'right',
            step: rect.width,
            point: rect.middleCenter,
            predict: (e) => {
                var dc = e.closest('[data-code]');
                if (dc) {
                    if (dc.getAttribute('data-code') != this.searchCode) {
                        return true;
                    }
                }
            }
        });
        if (fg) {
            var s = fg.closest('[data-code]') as HTMLElement;
            currentEl.classList.remove('item-hover-focus');
            s.classList.add('item-hover-focus');
            s.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            this.searchCode = s.getAttribute('data-code');
        }
    }
    private el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        document.addEventListener('mousedown', this.onGlobalMousedown);
        emojiStore.get().then(r => {
            this.emojis = r;
            this.searchCode = this.emojis.first().childs.first().code;
            this.forceUpdate();
        });
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown);
    }
    componentDidUpdate() {
        var el = this.el.querySelector('.selected') as HTMLElement;
        if (el) {
            el.scrollIntoView({
                block: "nearest",
                inline: "nearest"
            });
        }
    }
    onGlobalMousedown = (event: MouseEvent) => {
        if (this.visible == true && this.el) {
            var target = event.target as HTMLElement;
            if (this.el.contains(target)) return;
            this.close();
        }
    }
    onKeydown(event: KeyboardEvent) {
        if (this.visible == true) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                    this.keydown();
                    return true;
                case KeyboardCode.ArrowUp:
                    this.keyup();
                    return true;
                case KeyboardCode.ArrowLeft:
                    this.keyleft();
                    return true;
                case KeyboardCode.ArrowRight:
                    this.keyright();
                    return true;
                case KeyboardCode.Enter:
                    var sc=this.searchCode;
                    this.close();
                    console.log(this.searchCode, 'ssss');
                    if (sc) return { blockData: { url: '/emoji', isLine: true, src: { name: 'emoji', code:sc } } };
                    else return false;
            }
        }
        return false;
    }
}
export async function useEmojiSelector() {
    return await Singleton(EmojiSelector);
}