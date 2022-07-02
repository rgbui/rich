import React from "react";
import ReactDOM from "react-dom";
import { Singleton } from "../../component/lib/Singleton";
import { KeyboardCode } from "../../src/common/keys";
import { Rect, Point } from "../../src/common/vector/point";
import { InputTextPopSelector } from "../common/input.pop";
import { Loading } from "../../component/view/loading";
import { EmojiCode, emojiStore, EmojiType } from "./store";
import { Remark } from "../../component/view/text";
import { dom } from "../../src/common/dom";
import { getEmoji } from "../../net/element.type";
import { Tip } from "../../component/view/tooltip/tip";

/**
 * 用户输入@触发
 */
class EmojiSelector extends InputTextPopSelector {
    onClose(): void {
        throw new Error("Method not implemented.");
    }
    async open(
        round: Rect,
        text: string,
        callback: (...args: any[]) => void): Promise<boolean> {
        this._select = callback;
        this.pos = round.leftBottom;
        this.visible = true;
        var t = text.replace(/^::/, '');
        this.text = t;
        this.syncSearch();
        return true;
    }
    emojiCodes: EmojiCode[] = [];
    emojis: EmojiType[] = [];
    loading = false;
    isSearch = false;
    selectCode = '';
    async syncSearch() {
        this.loading = true;
        this.isSearch = false;
        this.forceUpdate();
        this.emojiCodes = [];
        this.emojis.forEach(ej => {
            ej.childs.forEach(c => {
                if (c.keywords.some(k => k == this.text))
                    this.emojiCodes.push(c);
            })
        })
        this.loading = false;
        this.isSearch = true;
        this.forceUpdate();
    }
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
                    return <Tip overlay={<>{emoji.name}</>} key={emoji.code}><span data-code={emoji.code} className={this.selectCode == emoji.code ? "selected" : ""} onMouseDown={e => this.onSelect(emoji)} dangerouslySetInnerHTML={{ __html: getEmoji(emoji.code) }}></span></Tip>
                })}</div>
            </div>)
        });
        if (this.scrollIndex > i) this.scrollOver = true;
        return els;
    }
    private renderSearchs() {
        return <div>
            {this.loading && <Loading></Loading>}
            {!this.loading && this.emojiCodes.map((emoji, i) => {
                return <a onMouseDown={e => this.onSelect(emoji)} data-code={emoji.code} className={this.selectCode == emoji.code ? "selected" : ""} key={emoji.code}>
                </a>
            })}
            {!this.loading && this.emojiCodes.length == 0 && this.isSearch && <a><Remark>没有搜索到</Remark></a>}
        </div>
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x
        }
        return <div>
            {this.visible && <div className='emoji-selectors' onScroll={e => this.onScroll(e)} style={style}>
                {!this.isSearch && this.renderEmojis()}
                {this.isSearch && this.renderSearchs()}
            </div>}
        </div>
    }
    private scrollIndex = 0;
    private scrollOver: boolean = false;
    private isScrollRendering: boolean = false;
    onScroll(event: React.UIEvent) {
        if (this.isSearch == true) return;
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
        this._select({ url: '/emoji', isLine: true, src: { mime: 'emoji', code: block.code } })
        this.close();
    }
    private visible: boolean = false;
    private pos: Point = new Point(0, 0)
    private _select: (block: Record<string, any>) => void;
    private text: string;
    private close() {
        this.isSearch = false;
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
        var currentEl = this.el.querySelector(`[data-code="${this.selectCode}"]`);
        var currentRect = Rect.fromEle(currentEl as HTMLElement);
        var predict = (g: HTMLElement) => {
            var gr = Rect.fromEle(g);
            if (gr.top > currentRect.bottom) {
                if (gr.left >= currentRect.left) return true;
            }
            return false;
        }
        var preEl = dom(currentEl).nextFind(predict, false, g => this.el.contains(g as HTMLElement));
        if (preEl) {
            this.selectCode = preEl.getAttribute('data-code');
            currentEl.classList.remove('selected');
            preEl.classList.add('selected');
        }
    }
    /**
     * 向上选择内容
     */
    private keyup() {
        var currentEl = this.el.querySelector(`[data-code="${this.selectCode}"]`);
        var currentRect = Rect.fromEle(currentEl as HTMLElement);
        var predict = (g: HTMLElement) => {
            var gr = Rect.fromEle(g);
            if (gr.bottom > currentRect.top) {
                if (gr.right >= currentRect.right) return true;
            }
            return false;
        }
        var preEl = dom(currentEl).prevFind(predict, false, g => this.el.contains(g as HTMLElement));
        if (preEl) {
            this.selectCode = preEl.getAttribute('data-code');
            currentEl.classList.remove('selected');
            preEl.classList.add('selected');
        }
    }
    private keyleft() {
        var currentEl = this.el.querySelector(`[data-code="${this.selectCode}"]`);
        var preEl = dom(currentEl).prevFind(g => (g as HTMLElement).getAttribute('data-code') ? true : false, false, g => this.el.contains(g as HTMLElement));
        if (preEl) {
            this.selectCode = preEl.getAttribute('data-code');
            currentEl.classList.remove('selected');
            preEl.classList.add('selected');
        }
    }
    private keyright() {
        var currentEl = this.el.querySelector(`[data-code="${this.selectCode}"]`);
        var preEl = dom(currentEl).nextFind(g => (g as HTMLElement).getAttribute('data-code') ? true : false, false, g => this.el.contains(g as HTMLElement));
        if (preEl) {
            this.selectCode = preEl.getAttribute('data-code');
            currentEl.classList.remove('selected');
            preEl.classList.add('selected');
        }
    }
    private el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        document.addEventListener('mousedown', this.onGlobalMousedown);
        emojiStore.get().then(r => { this.emojis = r; this.selectCode = this.emojis.first().childs.first().code; });
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
                    this.close();
                    if (this.selectCode) return { blockData: { url: '/emoji', isLine: true, src: { mime: 'emoji', code: this.selectCode } } };
            }
        }
        return false;
    }
}
export async function useEmojiSelector() {
    return await Singleton(EmojiSelector);
}