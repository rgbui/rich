import React from "react";
import { PopoverSingleton } from "../popover/popover";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverPosition } from "../popover/position";
import { LinkPageItem, LinkWs, getPageIcon, getPageText } from "../../src/page/declare";
import { SearchListType } from "../../component/types";
import lodash from "lodash";
import { channel } from "../../net/channel";
import { Input } from "../../component/view/input";
import { Spin } from "../../component/view/spin";
import { Icon } from "../../component/view/icon";
import { ToolTip } from "../../component/view/tooltip";
import { TrashSvg } from "../../component/svgs";
import { Divider } from "../../component/view/grid";
import { util } from "../../util/util";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";

export class TrashBox extends EventsComponent {
    render() {
        return <div className="w-600 min-h-200 bg-white round ">
            <div className="gap-w-14 padding-h-10">
                <div >
                    <Input
                        placeholder={lst('搜索{text}中被删除的页面',{text:this.ws?.text})}
                        clear
                        onClear={() => {
                            this.forceSearch();
                        }}
                        value={this.search.word}
                        onChange={e => {
                            this.search.word = e;
                            this.onSearch()
                        }}
                        onEnter={() => {
                            this.forceSearch();
                        }}></Input>
                </div>
            </div>
            <div>
                <Divider></Divider>
                <div className="flex padding-w-14">
                    <span className="f-12 remark"><S>已删除页面</S></span>
                </div>
                {this.search.loading && <Spin block><S>搜索中...</S></Spin>}
                {this.search.list.map(pa => {
                    return <div key={pa.id} className="flex item-hover round padding-h-3  padding-w-14 ">
                        <span className="flex-fixed flex-center size-24 item-hover  round "><Icon size={20} icon={getPageIcon(pa)}></Icon></span>
                        <span className="flex-fixed max-w-120 text-overflow gap-r-5">{getPageText(pa)}</span>
                        <span className="flex-fixed f-12 remark">
                            {util.showTime(pa.deletedDate)}
                        </span>
                        <span className="flex-auto flex-end r-size-24 r-flex-center r-item-hover r-round r-cursor r-gap-l-10">
                            <ToolTip overlay={lst('恢复')}><span onMouseDown={e => this.onRecover(pa)}><Icon size={18} icon={{ name: 'bytedance-icon', code: 'undo' }}></Icon></span></ToolTip>
                            <ToolTip overlay={lst('彻底删除')}><span onMouseDown={e => this.onDel(pa)}><Icon size={18} icon={TrashSvg}></Icon></span></ToolTip>
                        </span>
                    </div>
                })}
                {this.search.total == 0 && !this.search.loading && <div className="flex-center gap-h-10 f-12 remark"><S>无删除记录</S></div>}
            </div>
        </div>
    }
    el: HTMLElement;
    ws: LinkWs;
    parentId: string
    search: SearchListType<LinkPageItem> = {
        word: '',
        list: [],
        size: 50,
        loading: false,
        total: 0
    }
    onSearch = lodash.debounce(async () => {
        await this.forceSearch();
    })
    async forceSearch() {
        this.search.loading = true;
        this.forceUpdate();
        var rg = await channel.get('/page/deleted/query', {
            ws: this.ws,
            word: this.search.word || undefined,
            size: this.search.size,
        })
        if (rg.ok) {
            this.search = Object.assign(this.search, rg.data);
            this.search.loading = false;
            this.forceUpdate();
        }
    }
    async onDel(item: LinkPageItem) {
        await channel.del('/page/deleted/clean', { ws: this.ws, pageId: item.id });
        lodash.remove(this.search.list, g => g.id == item.id);
        this.forceUpdate();
    }
    hasReover: boolean = false;
    async onRecover(item: LinkPageItem) {
        await channel.post('/page/item/recover', { ws: this.ws, pageId: item.id, parentId: this.parentId })
        this.hasReover = true;
        lodash.remove(this.search.list, g => g.id == item.id);
        this.forceUpdate();
    }
    async open(options: { ws: LinkWs, parentId: string }) {
        this.ws = options.ws;
        this.hasReover = false;
        this.parentId = options.parentId;
        await this.forceSearch();
    }
}

export async function useTrashBox(options?: { ws: LinkWs, parentId: string }) {
    var pos: PopoverPosition = { center: true, centerTop: 100 };
    let popover = await PopoverSingleton(TrashBox, { mask: true, frame: true, shadow: true, });
    let fv = await popover.open(pos);
    await fv.open(options);
    return new Promise((resolve: (p: boolean) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(fv.hasReover ? true : null);
        });
        popover.only('close', () => {
            resolve(fv.hasReover ? true : null);
        });
    })
}