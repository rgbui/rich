import React from "react";
import { Singleton } from "../../component/lib/Singleton";
import { Rect } from "../../src/common/vector/point";
import { InputTextPopSelector } from "../common/input.pop";
import { EmojiCode, emojiStore, EmojiType } from "./store";
import { dom, domVisibleSeek } from "../../src/common/dom";
import { getEmoji } from "../../net/element.type";
import { Tip } from "../../component/view/tooltip/tip";
import { Spin } from "../../component/view/spin";
import { S } from "../../i18n/view";


/**
 * 用户输入::触发
 */
class EmojiSelector extends InputTextPopSelector<EmojiCode> {
    prefix: string[] = ['::', '：：', ';;', '；；'];
    emojis: EmojiType[] = [];
    searchCode = '';
    lazyTime: number = 0;
    async searchAll() {
        var r = await emojiStore.get();
        this.emojis = r;
        this.searchCode = this.emojis.first().childs.first().code;
    }
    async searchByWord(word: string) {
        var list: EmojiCode[] = [];
        if (!word) return [];
        this.emojis.forEach(ej => {
            ej.childs.forEach(c => {
                if (c.name && c.name == word || c.name && c.name.indexOf(word) > -1 || c.keywords.some(k => k == word || k.indexOf(word) > -1))
                    list.push(c);
            })
        })
        if (!list.some(s => s.code == this.searchCode)) {
            this.searchCode = list.first()?.code;
        }
        return list;
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
            {!this.loading && <div className="flex flex-wrap padding-10" >{this.list.map((emoji, i) => {
                return <Tip overlay={<>{emoji.name}</>} key={emoji.code}><span data-code={emoji.code} className={'size-32 round cursor flex-center ef f-24 ' + (this.searchCode == emoji.code ? "item-hover-focus" : "")} onMouseDown={e => this.onSelect(emoji)} dangerouslySetInnerHTML={{ __html: getEmoji(emoji.code) }}></span></Tip>
            })}</div>}
            {!this.loading && this.list.length == 0 && <div className="remark flex-center"><S>没有搜索到</S></div>}
        </div>
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x,
            display: this.visible ? "block" : 'none'
        }
        return <div className='emoji-selectors' onScroll={e => this.onScroll(e)} style={style}>
            {!this.searchWord && this.renderEmojis()}
            {this.searchWord && this.renderSearchs()}
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
    onSelect(block: EmojiCode) {
        this._select({ url: '/emoji', isLine: true, data: { src: { name: 'emoji', code: block.code } } })
        this.close();
    }
    close() {
        this.searchCode = '';
        super.close();
    }
    /**
     * 向下选择内容
     */
    keydown(e) {
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
        return true;
    }
    /**
     * 向上选择内容
     */
    keyup(e) {
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
        return true;
    }
    keyleft(e) {
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
        return true;
    }
    keyright(e) {
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
        return true;
    }
    getSelectBlockData() {
        if (this.searchCode) {
            return {
                blockData: {
                    url: '/emoji',
                    isLine: true,
                    src: {
                        name: 'emoji',
                        code: this.searchCode
                    }
                }
            }
        }
        return null;
    }
}
export async function useEmojiSelector() {
    return await Singleton(EmojiSelector);
}