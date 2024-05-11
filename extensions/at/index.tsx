import React from "react";
import { Singleton } from "../../component/lib/Singleton";
import { Avatar } from "../../component/view/avator/face";
import { channel } from "../../net/channel";
import { UserBasic } from "../../types/user";
import { InputTextPopSelector } from "../common/input.pop";
import { Spin } from "../../component/view/spin";
import { popoverLayer } from "../../component/lib/zindex";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { util } from "../../util/util";

/**
 * 用户输入@触发
 */
class AtUserSelector extends InputTextPopSelector<UserBasic> {
    prefix = ['@']
    async searchByWord(word: string) {
        if (this.allList.total > 0 && this.allList.total < this.allList.size) {
            if (!word) return this.allList.list.map(g => g);
            else return this.allList.list.findAll(g => g.name && g.name.startsWith(word) || g.name.indexOf(word) > -1);
        }
        else {
            if (!word && this.allList.list.length > 0) {
                return this.allList.list.map(g => g);
            }
            var r = (await channel.get('/ws/member/word/query', { word: word, ws: this.page?.ws })).data.list;
            if (lst('所有人').startsWith(word)) r.splice(0, 0, { id: 'all', userid: 'all', name: lst('所有人') })
            return r;
        }
    }
    async searchAll() {
        if (this.allList.lastDate && Date.now() - this.allList.lastDate.getTime() > 5000) {
            var r = await channel.get('/ws/member/word/query', { size: this.allList.size, ws: this.page?.ws });
            this.allList = r.data;
            this.allList.list.splice(0, 0, { id: 'all', userid: 'all', name: lst('所有人') } as any)
            this.allList.lastDate = new Date();
        }
    }
    onSelect(block) {
        this._select({
            url: '/user/mention',
            isLine: true,
            data: {
                refLinks: [{
                    id: util.guid(),
                    type: "mention",
                    userid: (block as any).userid,
                }]
            }
        })
        this.close();
    }
    getSelectBlockData() {
        var r = this.list[this.selectIndex - this.selectDeep];
        if (r) {
            return {
                blockData: {
                    url: '/user/mention',
                    isLine: true,
                    refLinks: [{
                        id: util.guid(),
                        type: "mention",
                        userid: (r as any).userid,
                    }]
                }
            }
        }
        return null;
    }
    private renderLinks() {
        return <div>
            {this.loading && <div className="flex-center gap-h-10"><Spin></Spin></div>}
            {!this.loading && this.list.map((link, i) => {
                return <div
                    onMouseDown={e => this.onSelect(link)} className={"gap-w-10  flex item-hover cursor round padding-5 " + (i == this.selectIndex ? "  item-hover-focus" : "")}
                    key={link.id}>
                    <span className="flex-fixed flex-center"><Avatar size={24} showName userid={(link as any).userid}></Avatar></span>
                </div>
            })}
            {!this.loading && this.searchWord && this.list.length == 0 && <div className="flex-center gap-h-10 remark"><S>没有搜索到</S></div>}
        </div>
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x,
            display: this.visible ? 'block' : 'none',
            zIndex: popoverLayer.zoom(this)
        }
        return <div className='pos w-250 max-h-200 bg-white overlay-y  round shadow border padding-h-10' style={style}>{this.renderLinks()}</div>
    }
}
export async function useAtUserSelector() {
    return await Singleton(AtUserSelector);
}
