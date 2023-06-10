import React from "react";
import { Singleton } from "../../component/lib/Singleton";
import { Icon } from "../../component/view/icon";
import { LangID } from "../../i18n/declare";
import { Sp } from "../../i18n/view";
import { InputTextPopSelector } from "../common/input.pop";
import { BlockSelectorItem } from "./delcare";
import { blockStore } from "./store";

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
            return <div className="flex-center remark f-14  padding-10">
                <Sp id={LangID.blockSelectorNoData}></Sp>
            </div>
        }
        return this.list.map((group, g) => {
            return <div key={group.text}>
                <div className="remark flex f-12  padding-w-10 h-24">{group.text}</div>
                <div>
                    {group.childs.map((child, index) => {
                        i += 1;
                        let j = i;
                        return <div key={child.url} onMouseDown={e => this.onSelect(child)} className={'cursor flex h-30 round item-hover padding-w-10 ' + (j == this.selectIndex ? 'item-hover-focus' : '')}>
                            <div className="flex-center size-24 text-1 gap-r-5">
                                <Icon size={16} icon={child.icon}></Icon>
                            </div>
                            <div className="f-14 flex-auto text">{child.text}</div>
                            <div className="remark f-14 flex-fixed">{child.label}</div>
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
