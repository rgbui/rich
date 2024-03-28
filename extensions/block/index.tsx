import React from "react";
import { Singleton } from "../../component/lib/Singleton";
import { Icon } from "../../component/view/icon";
import { InputTextPopSelector } from "../common/input.pop";
import { BlockSelectorItem } from "./delcare";
import { blockStore } from "./store";
import { S } from "../../i18n/view";

class BlockSelector extends InputTextPopSelector<{
    childs: BlockSelectorItem[];
    text: string;
}> {
    prefix: string[] = ['/', '、'];
    lazyTime: number = 0;
    async searchAll() {
        await blockStore.import();
    }
    async searchByWord(word: string) {
        return blockStore.findAll('/' + word);
    }
    private renderSelectors() {
        var i = -1;
        if (this.list.length == 0) {
            return <div className="flex-center remark f-14  padding-w-10 padding-h-5">
                <S>没有搜到块</S>
            </div>
        }
        return this.list.map((group, g) => {
            return <div key={group.text + g.toString()}>
                <div className="remark flex f-12  padding-w-14 h-24">{group.text}</div>
                <div className="gap-b-10">
                    {group.childs.map((child, index) => {
                        i += 1;
                        let j = i;
                        return <div key={child.url + (index.toString())}
                            onMouseDown={e => this.onSelect(child)}
                            className={'cursor flex h-30 round item-hover-light padding-w-5 gap-w-5 ' + (j == this.selectIndex ? 'item-hover-light-focus' : '')}>
                            <div className="flex-center size-24 text gap-r-5">
                                <Icon size={16} icon={child.icon}></Icon>
                            </div>
                            <div className="f-14 flex-auto text">{child.text}</div>
                            <div className="remark f-12 flex-fixed gap-r-3">{child.label}</div>
                        </div>
                    })}
                </div>
            </div>
        })
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x,
            display: this.visible ? "block" : 'none'
        }
        return <div className='shy-block-selector' style={style}>{this.renderSelectors()}</div>
    }
    onSelect(block?: BlockSelectorItem) {
        if (typeof this._select == 'function') this._select(block, this.getFilterText(this.text))
        this.close();
    }
    private getFilterText(text): string {
        return text.replace(/(\/|、)[\w \-\u4e00-\u9fa5]*$/g, '');
    }
    getSelectBlockData() {
        var r;
        var i = 0;
        this.list.forEach((c) => {
            if (Array.isArray(c.childs)) {
                c.childs.forEach(cc => {
                    if (i == this.selectIndex) {
                        r = cc;
                    }
                    i += 1;
                })
            }
        })
        if (r) {
            return {
                ...r
            }
        }
        return null;
    }
    enter(event: KeyboardEvent) {
        var r = this.getSelectBlockData();
        if (r) {
            this.onSelect(r);
        }
        return true;
    }
    getListCount(): number {
        var i = 0;
        this.list.forEach((c) => {
            if (Array.isArray(c.childs)) {
                c.childs.forEach(cc => {
                    i += 1;
                })
            }
        })
        return i;
    }
}

export async function useBlockSelector() {
    return await Singleton(BlockSelector);
}
