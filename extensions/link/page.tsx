
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
import { Rect } from "../../src/common/vector/point";
import { Page } from "../../src/page";
import { S } from "../../i18n/view";
import { UA } from "../../util/ua";

/**
 * 用户输入[[触发
 */
class PageLinkSelector extends InputTextPopSelector<LinkPageItem> {
    prefix = ['[[', '【【'];
    selectDeep: number = 1;
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
            // if (this.continuousSearchEmpty == true) {
            //     this.close();
            //     return this.visible;
            // }
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
            <div className={"flex  remark padding-w-10 padding-h-3 " + (this.list.length > 0 ? "border-top" : "")}>
                <span className="flex-fixed size-14 flex-center"><Icon size={14} icon={{ name: 'byte', code: 'arrow-up' }}></Icon></span>
                <span className="flex-fixed size-14 flex-center  gap-r-10"><Icon size={14} icon={{ name: 'byte', code: 'arrow-down' }}></Icon></span>
                <span className="flex-fixed f-12 gap-r-5"><S>选择</S></span>
                <span className="flex-fixed size-14 flex-center gap-r-10">{UA.isMacOs ? <Icon size={14} icon={{ name: 'byte', code: 'corner-down-left' }}></Icon> : "enter"}</span>
                <span className="flex-fixed f-12 gap-r-5"><S>结束</S></span>
                <span className="flex-fixed f-12 gap-r-10">space</span>
            </div>
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
