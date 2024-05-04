
import React from "react";
import { Singleton } from "../../component/lib/Singleton";
import { PlusSvg } from "../../component/svgs";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { BlockUrlConstant } from "../../src/block/constant";
import { InputTextPopSelector } from "../common/input.pop";
import { LinkPageItem, getPageIcon } from "../../src/page/declare";
import { Spin } from "../../component/view/spin";
import { util } from "../../util/util";
import { channel } from "../../net/channel";
import "./style.less";

/**
 * 用户输入[[触发
 */
class PageLinkSelector extends InputTextPopSelector<LinkPageItem> {
    prefix = ['[[', '【【'];
    selectDeep: number = 1;
    async searchByWord(word: string) {
        if (this.allList.total > 0 && this.allList.total < this.allList.size) {
            return this.allList.list.findAll(g => g.text && g.text.startsWith(word) || g.text.indexOf(word) > -1);
        }
        else {
            var r = (await channel.get('/page/word/query', { word: word, ws: this.page.ws })).data.list;
            return r;
        }
    }
    async searchAll() {
        if (this.allList.lastDate && Date.now() - this.allList.lastDate.getTime() > 5000) {
            var r = await channel.get('/page/word/query', { size: this.allList.size, ws: this.page.ws });
            this.allList = r.data;
            this.allList.lastDate = new Date();
        }
    }
    private renderLinks() {
        return <div>
            {this.searchWord && this.list.length == 0 && <><a className={"h-28 gap-h-5 text item-hover cursor round padding-w-5 gap-w-5 flex" + (0 == this.selectIndex ? " item-hover-focus" : "")} onMouseDown={e => this.onSelect({ name: 'create' })}>
                <span className="flex flex-center size-24 item-hover round">
                    <Icon size={16} icon={PlusSvg}></Icon>
                </span>
                <span className="f-14">创建<b className="bold">{this.text || '新页面'}</b>
                </span>
            </a><Divider></Divider></>}
            {this.loading && <div className="flex-center h-28 gap-h-5"><Spin></Spin></div>}
            {!this.loading && this.list.map((link, i) => {
                return <a onMouseDown={e => this.onSelect(link)} className={"h-28 gap-h-5  text  item-hover cursor round padding-w-5 gap-w-5 flex" + (i == this.selectIndex ? " item-hover-focus" : "")} key={link.id}>
                    <span className="flex-fixed flex flex-center size-24 item-hover round"> <Icon size={16} icon={getPageIcon(link)}></Icon></span>
                    <span className="flex-auto f-14 text-overflow">{link.text || '新页面'}</span></a>
            })}
        </div>
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x,
            display: this.visible ? "block" : 'none'
        }
        return <div className='shy-page-link' style={style}>{this.renderLinks()}</div>
    }
    onSelect(block) {
        if (block.name == 'create') {
            this._select({ url: BlockUrlConstant.Text, isLine: true, data: { content: this.text || "新页面" }, operator: { name: "create", text: this.text || "新页面" } })
        }
        else {
            this._select({
                url: BlockUrlConstant.Text,
                isLine: true,
                data: {
                    content: block.text,
                    refLinks: [{ id: util.guid(), type: 'page', pageId: block.id }]
                }
            })
        }
        this.close();
    }
    getSelectBlockData() {
        if (this.selectIndex == 0 && this.list.length == 0 && this.searchWord) {
            return {
                blockData: {
                    url: BlockUrlConstant.Text,
                    isLine: true,
                    data: { content: this.text || "新页面" },
                    operator: { name: "create", text: this.text || "新页面" }
                }
            }
        }
        else {
            var b = this.list[this.selectIndex];
            if (!b) return false;
            return {
                blockData: {
                    url: BlockUrlConstant.Text,
                    isLine: true,
                    data: {
                        content: b.text || "新页面",
                        refLinks: [{ id: util.guid(), type: 'page', pageId: b.id }]
                    }
                }
            }
        }
    }
}
export async function usePageLinkSelector() {
    return await Singleton(PageLinkSelector);
}
