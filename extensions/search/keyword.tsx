import lodash from "lodash";
import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { Input } from "../../component/view/input";
import { channel } from "../../net/channel";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import "./style.less";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";
import { Spin } from "../../component/view/spin";
import { AiStartSvg, SearchSvg } from "../../component/svgs";
import { SearchListType } from "../../component/types";
import { util } from "../../util/util";
import { SwitchText } from "../../component/view/switch";
import { SelectBox } from "../../component/view/select/box";
import { ToolTip } from "../../component/view/tooltip";
import { useAISearchBox } from "./ai";

export class SearchBox extends EventsComponent {
    render() {
        var ws = channel.query('/current/workspace');
        return <div className="w-800 bg-white  round">
            <div className="padding-10 flex">
                <div className="flex-auto">
                    <Input clear noborder
                        prefix={<span className="flex cursor">
                            <span className="flex-center size-20  text-1"><Icon className={'text-1'} size={18} icon={SearchSvg}></Icon></span>
                        </span>}
                        size='larger'
                        onClear={() => { this.searchList.word = ''; this.onForceSearch() }}
                        placeholder={`在 ${ws.text || '空间'} 中搜索`}
                        value={this.searchList.word}
                        onEnter={e => { this.searchList.word = e; this.onForceSearch() }}
                        onChange={e => { this.searchList.word = e; this.onSearch() }} ></Input>
                </div>
                <div className="flex-fixed text-1">
                    <ToolTip overlay={'AI语义搜索'}>
                        <span onMouseDown={e => this.openAi(e)} className="flex flex-center size-24 cursor item-hover round">
                            <Icon size={18} icon={AiStartSvg}></Icon>
                        </span>
                    </ToolTip>
                </div>
            </div>
            {this.searchList.word && <><Divider></Divider>
                <div className="flex f-12 remark padding-w-10 padding-t-5">
                    <SwitchText className={'flex-fixed'} checked={this.searchList.isOnlySearchTitle} onChange={e => {
                        this.searchList.isOnlySearchTitle = e;
                        this.onForceSearch()
                    }}>仅区配标题</SwitchText>
                    <span className="flex-auto flex-end">
                        <span className="gap-r-5">编辑时间</span>
                        <SelectBox inline value={this.searchList.editDate} onChange={e => { this.searchList.editDate = e; this.onForceSearch() }} options={[{ text: '降序', value: -1 }, { text: '升序', value: 1 }]}></SelectBox>
                    </span>
                </div>
                <div className="padding-h-10 overflow-y max-h-300 min-h-120">
                    {this.searchList.loading && <Spin block></Spin>}
                    {!this.searchList.loading && this.searchList.word && this.renderList()}
                </div>
            </>}
        </div>
    }
    renderList() {
        if (this.searchList.list.length == 0 && this.searchList.pages.length == 0) return <div className="h-30 flex-center remark">没有搜到相关的内容</div>
        if (this.searchList.pages?.length > 0 && this.searchList.list.length == 0) {
            return this.searchList.pages.map(r => {
                return <div key={r.id} className="padding-10 item-hover round cursor" onMouseDown={e => this.onSelect(r)}>
                    <div className="flex">
                        <span className="flex-fixed flex-line flex-center size-20 round text gap-r-5"><Icon size={16} icon={getPageIcon(r)}></Icon></span>
                        <span className="text f-14 flex-auto">{getPageText(r)}</span>
                        <span className="flex-fixed remark f-14">{util.showTime(r.editDate || r.createDate)}</span>
                    </div>
                </div>
            })
        }
        return this.searchList.list.map(r => {
            return <div key={r.id} className="padding-10 item-hover round cursor" onMouseDown={e => this.onSelect(r)}>
                <div className="flex">
                    <span className="flex-line flex-center size-20 round text gap-r-5"><Icon size={16} icon={getPageIcon(r)}></Icon></span>
                    <span className="text f-14">{getPageText(r)}</span>
                </div>
                <div className="remark f-14">{r.content}</div>
            </div>
        })
    }
    el: HTMLElement;
    isNav: boolean = false;
    async open(options?: { word?: string, isNav?: boolean }) {
        if (options?.word) this.searchList.word = options?.word;
        else this.searchList.word = '';
        if (options?.isNav) this.isNav = true;
        else this.isNav = false;
        if (this.searchList.word) {
            await this.onForceSearch()
        }
        this.forceUpdate();
    }
    async onSelect(item: LinkPageItem) {
        if (this.isNav == true) {
            channel.air('/page/open', { item: item.id });
        }
        this.emit('save', item);
    }
    searchList: SearchListType<{ id: string, creater: string, score?: string, title?: string, content: string }, { isOnlySearchTitle?: boolean, editDate: number, pages: LinkPageItem[] }> = { editDate: -1, isOnlySearchTitle: false, loading: false, list: [], pages: [], total: 0, page: 1, size: 20 };
    onForceSearch = async () => {
        if (this.searchList.word) {
            this.searchList.loading = true;
            this.forceUpdate();
            try {
                var r = await channel.get('/ws/search', {
                    word: this.searchList.word,
                    editDate: this.searchList.editDate,
                    isOnlySearchTitle: this.searchList.isOnlySearchTitle
                });
                if (r.ok) {
                    this.searchList = Object.assign(this.searchList, r.data);
                    if (!Array.isArray(this.searchList.pages)) this.searchList.pages = [];
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                this.searchList.loading = false;
                this.forceUpdate();
            }
        }
        else this.forceUpdate()
    }
    onSearch = lodash.debounce(async () => {
        this.onForceSearch();
    }, 1000)
    async openAi(e: React.MouseEvent) {
        this.emit('close');
        await channel.act('/cache/set', { key: 'search-mode', value: 'ai' })
        useAISearchBox()
    }
}

export async function useSearchBox(options?: { word?: string, isNav?: boolean }) {
    var pos: PopoverPosition = { center: true, centerTop: 100 };
    let popover = await PopoverSingleton(SearchBox, { mask: true, frame: true, shadow: true, });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (p: { id: string, content?: string }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        popover.only('close', () => {
            resolve(null)
        });
    })
}