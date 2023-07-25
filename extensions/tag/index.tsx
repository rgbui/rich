import React from "react";
import { Singleton } from "../../component/lib/Singleton";
import { InputTextPopSelector } from "../common/input.pop";
import { PlusSvg, TopicSvg } from "../../component/svgs";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { Spin } from "../../component/view/spin";
import { BlockUrlConstant } from "../../src/block/constant";
import { popoverLayer } from "../../component/lib/zindex";
import { util } from "../../util/util";
import { channel } from "../../net/channel";

/**
 * 用户输入#触发
 */
class TagSelector extends InputTextPopSelector<{ id: string, tag: string }> {
    prefix: string[] = ['#'];
    selectDeep: number = 1;
    async searchByWord(word: string) {
        if (this.allList.total > 0 && this.allList.total < this.allList.size) {
            return this.allList.list.findAll(g => g.tag && g.tag.startsWith(word) || g.tag.indexOf(word) > -1);
        }
        else {
            var r = (await channel.get('/tag/word/query', { word: word, ws: this.page.ws })).data.list;
            return r;
        }
    }
    async searchAll() {
        if (this.allList.lastDate && Date.now() - this.allList.lastDate.getTime() > 5000) {
            var r = await channel.get('/tag/word/query', { size: this.allList.size, ws: this.page.ws });
            this.allList = r.data;
            this.allList.lastDate = new Date();
        }
    }
    private renderLinks() {
        return <div>
            <a className={"h-30 gap-l-10 text item-hover cursor round padding-w-10 flex" + (0 == this.selectIndex ? " item-hover-focus" : "")} onMouseDown={e => this.onSelect({ name: 'create' })}>
                <span className="flex flex-inline size-24 item-hover round"> <Icon size={18} icon={TopicSvg}></Icon></span>
                <span className="f-14 flex-auto flex">
                    创建<b className="bold gap-l-5">{this.text || '标签'}</b>
                </span>
                <span className="flex-fixed flex flex-inline size-24 item-hover round">
                    <Icon size={18} icon={PlusSvg}></Icon>
                </span>
            </a>
            <Divider></Divider>
            {this.loading && <div className="flex-center gap-h-30"><Spin></Spin></div>}
            {!this.loading && this.list.map((link, i) => {
                return <a onMouseDown={e => this.onSelect(link)} className={"h-30 gap-l-10 text  item-hover cursor round padding-w-10 flex" + ((i + 1) == this.selectIndex ? " item-hover-focus" : "")} key={link.id}>
                    <span className="flex flex-inline size-24 item-hover round"><Icon size={18} icon={TopicSvg}></Icon></span>
                    <span className="f-14">{link.tag || '标签'}</span></a>
            })}
            {this.loading && this.list.length == 0 && this.searchWord && <div className="remark flex-center gap-h-10 f-14">没有搜索到</div>}
        </div>
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x,
            display: this.visible ? 'block' : 'none',
            zIndex: popoverLayer.zoom(this)
        }
        return <div ref={e => this.el = e}
            style={style}
            className='pos w-250 max-h-200 bg-white overlay-y  round shadow '>{this.renderLinks()}
        </div>
    }
    onSelect(block) {
        if (block.name == 'create') {
            this._select({
                url: BlockUrlConstant.Tag,
                isLine: true,
                link: { name: 'create', text: this.text || '标签' }
            })
        }
        else {
            this._select({
                url: BlockUrlConstant.Tag,
                isLine: true,
                refLinks: [{
                    id: util.guid(),
                    type: 'tag',
                    tagText: block.tag,
                    tagId: block.id
                }]
            })
        }
        this.close();
    }
    getSelectBlockData() {
        if (this.selectIndex == 0) {
            return {
                blockData: {
                    url: BlockUrlConstant.Tag,
                    isLine: true,
                    link: { name: 'create', text: this.text || '标签' }
                }
            }
        }
        else {
            var b = this.list[this.selectIndex - 1];
            if (!b) return false;
            return {
                blockData: {
                    url: BlockUrlConstant.Tag,
                    isLine: true,
                    refLinks: [{
                        id: util.guid(),
                        type: 'tag',
                        tagText: b.tag,
                        tagId: b.id
                    }]
                }
            }
        }
    }
}
export async function useTagSelector() {
    return await Singleton(TagSelector);
}