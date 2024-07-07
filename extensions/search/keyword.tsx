import lodash from "lodash";
import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { Input } from "../../component/view/input";
import { channel } from "../../net/channel";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";
import { Spin } from "../../component/view/spin";
import { AiStartSvg, SearchSvg } from "../../component/svgs";
import { SearchListType } from "../../component/types";
import { util } from "../../util/util";
import { SwitchText } from "../../component/view/switch";
import { SelectBox } from "../../component/view/select/box";
import { useAISearchBox } from "./ai";
import { isMobileOnly } from "react-device-detect";
import { lst } from "../../i18n/store";
import { S, Sp } from "../../i18n/view";
import { UA } from "../../util/ua";
import "./style.less";
import { KeyboardCode } from "../../src/common/keys";
import { MenuItemType } from "../../component/view/menu/declare";

export class SearchBox extends EventsComponent {
    searchInput: Input;
    render() {
        var ws = this.ws;
        return <div style={{ userSelect: 'none' }} className={"bg-white  round" + (isMobileOnly ? " vw100-c20" : " w-800 ")}>
            <div className="padding-w-10 padding-h-5 flex">
                <div className="flex-auto">
                    <Input
                        style={{ userSelect: 'auto' }}
                        clear
                        noborder
                        ref={e => this.searchInput = e}
                        prefix={<span className="flex cursor">
                            <span className="flex-center size-20  text-1"><Icon className={'remark'} size={16} icon={SearchSvg}></Icon></span>
                        </span>}
                        inputStyle={{ fontSize: '20px' }}
                        size='larger'
                        onClear={() => { this.searchList.word = ''; this.onForceSearch() }}
                        placeholder={lst('在{text}中搜索', { text: ws?.text || lst('空间') })}
                        value={this.searchList.word}
                        onKeydown={e => {
                            this.onKeydown(e);
                        }}
                        // onEnter={e => { this.searchList.word = e; this.onForceSearch() }}
                        onChange={e => { this.searchList.word = e; this.onSearch() }} ></Input>
                </div>
            </div>
            <Divider></Divider>
            {this.searchList.word && <div className="flex f-12 remark padding-w-5 gap-w-5 padding-t-5">
                <SwitchText size="small" className={'flex-fixed item-hover round padding-w-3 '} checked={this.searchList.isOnlySearchTitle} onChange={e => {
                    this.searchList.isOnlySearchTitle = e;
                    this.onForceSearch()
                }}><S>仅匹配标题</S></SwitchText>
                <span className="flex-auto flex-end">
                    <span className="padding-w-3 round cursor item-hover">
                        <SelectBox
                            className={'f-12'}
                            inline
                            value={typeof this.searchList.editDate == 'number' ? this.searchList.editDate : (this.searchList.createDate == 1 ? 3 : 2)}
                            // iconHidden={true}
                            onChange={e => {
                                if (e > 1) {
                                    this.searchList.createDate = e == 2 ? 1 : -1
                                    this.searchList.editDate = null
                                }
                                else {
                                    this.searchList.editDate = e;
                                    this.searchList.createDate = null
                                }
                                this.onForceSearch()
                            }}
                            options={[
                                { text: lst('编辑时间'), value: 1, icon: { name: 'bytedance-icon', code: 'arrow-up' } },
                                { text: lst('编辑时间'), value: -1, icon: { name: 'bytedance-icon', code: 'arrow-down' } },
                                { type: MenuItemType.divide },
                                { text: lst('创建时间'), value: 3, icon: { name: 'bytedance-icon', code: 'arrow-up' } },
                                { text: lst('创建时间'), value: 2, icon: { name: 'bytedance-icon', code: 'arrow-down' } },
                            ]}></SelectBox>
                    </span>
                </span>
            </div>}
            <div ref={e => this.scrollEl = e} className="padding-b-10 overflow-y max-h-300">
                {!this.searchList.word && this.renderRecent()}
                {this.searchList.word && <div>
                    {this.searchList.loading && <Spin block></Spin>}
                    {!this.searchList.loading && this.renderList()}
                </div>}
            </div>
            {!this.searchList.word && <div className="flex border-top remark padding-w-10 padding-h-3">
                <span className="flex-fixed size-14 flex-center"><Icon size={14} icon={{ name: 'byte', code: 'arrow-up' }}></Icon></span>
                <span className="flex-fixed size-14 flex-center"><Icon size={14} icon={{ name: 'byte', code: 'arrow-down' }}></Icon></span>
                <span className="flex-fixed f-12 gap-r-10"><S>选择</S></span>
                <span className="flex-fixed size-14 flex-center">{UA.isMacOs ? <Icon size={14} icon={{ name: 'byte', code: 'corner-down-left' }}></Icon> : "enter"}</span>
                <span className="flex-fixed f-12"><S>打开</S></span>
                {!this.ws?.aiConfig?.aiSearch && <span className="flex-auto flex-end" onMouseDown={e => { this.abledAi(e) }}>
                    <span className="flex-fixed remark item-hover cursor  f-12"><S>开启AI智能检索</S></span>
                </span>}
            </div>}
        </div>
    }
    scrollEl: HTMLElement;
    onKeydown(e: React.KeyboardEvent) {
        if (e.key == KeyboardCode.ArrowDown) {
            this.index++;
            if (this.searchList.word) {
                if (this.index >= this.searchList.pages.length) this.index = this.searchList.pages.length - 1;
            }
            else {
                if (this.index >= this.recentItems.length) this.index = this.recentItems.length - 1;
            }
            this.forceUpdate(() => {
                if (this.scrollEl) {
                    (this.scrollEl.querySelector('.item-hover-focus') as HTMLElement)?.scrollIntoView({ block: 'nearest', behavior: 'smooth', inline: 'nearest' })
                }
            })
        }
        else if (e.key == KeyboardCode.ArrowUp) {
            this.index--;
            if (this.ws?.aiConfig?.aiSearch) { if (this.index < -1) this.index = -1; }
            else {
                if (this.index < 0) this.index = 0;
            }
            this.forceUpdate(() => {
                if (this.scrollEl) {
                    (this.scrollEl.querySelector('.item-hover-focus') as HTMLElement)?.scrollIntoView({ block: 'nearest', behavior: 'smooth', inline: 'nearest' })
                }
            })
        }
        else if (e.key == KeyboardCode.Enter) {
            if (this.index == -1) this.openAi()
            else
                this.onSelect(this.searchList.word ? this.searchList.pages[this.index] : this.recentItems[this.index])
        }
    }
    renderList() {

        if (this.searchList.list.length == 0 && this.searchList.pages.length == 0) return <div>
            {this.ws?.aiConfig?.aiSearch && <div onMouseDown={e => this.openAi(e)} className={"flex h-30  padding-w-5 gap-w-5  round cursor " + (this.index == -1 ? "item-hover-focus" : "item-hover")}>
                <span className="size-24 flex-center flex-fixed "><Icon className={'text-pu'} size={18} icon={AiStartSvg}></Icon></span>
                <span className="flex-fixed flex">使用AI智能检索<b className="bold text-overflow" style={{ display: 'inline-block', maxWidth: 200 }}>{this.searchList.word}</b></span>
                <span className="flex-fixed size-24 flex-center  remark  round item-hover">
                    <Icon size={18} icon={{ name: 'byte', code: 'corner-up-right' }}></Icon>
                </span>
            </div>}
            <div className="h-30 gap-h-10 flex-center remark"><S>没有搜到相关内容</S></div>
        </div>
        if (this.searchList.pages?.length > 0 && this.searchList.list.length == 0) {
            return <div>

                {this.ws?.aiConfig?.aiSearch && <div onMouseDown={e => this.openAi(e)} className="flex h-30  padding-w-5 gap-w-5 item-hover round cursor">
                    <span className="size-24 flex-center flex-fixed "><Icon className={'text-pu'} size={18} icon={AiStartSvg}></Icon></span>
                    <span className="flex-auto">使用AI智能检索<b>{this.searchList.word}</b></span>
                    <span className="flex-fixed size-24 remark flex-center round item-hover">
                        <Icon size={18} icon={{ name: 'byte', code: 'corner-up-right' }}></Icon>
                    </span>
                </div>}
                <div className="flex gap-h-5 padding-w-5 gap-w-5">
                    <span className="remark f-12"><Sp text={'共{count}条匹配结果'} data={{ count: this.searchList.total }}>共0条匹配结果</Sp></span>
                    <span></span>
                </div>

                {this.searchList.pages.map(r => {
                    return <div key={r.id} className="padding-w-5 padding-h-5 gap-h-5 gap-w-5 item-hover round cursor" onMouseDown={e => this.onSelect(r)}>
                        <div className="flex">
                            <span className="flex-fixed flex-line flex-center size-20 round remark gap-r-5"><Icon size={16} icon={getPageIcon(r)}></Icon></span>
                            <span className="text f-14 flex-auto">{getPageText(r)}</span>
                            <span className="flex-fixed remark f-12">{util.showTime(r.editDate || r.createDate)}</span>
                        </div>
                    </div>
                })}</div>
        }
        return this.searchList.list.map(r => {
            var pa = this.searchList.pages.find(s => s.id == r.id);
            return <div key={r.id} className="padding-10 item-hover round cursor" onMouseDown={e => this.onSelect(pa)}>
                <div className="flex">
                    <span className="flex-line flex-fixed flex-center size-20 round remark gap-r-5"><Icon size={16} icon={getPageIcon(pa)}></Icon></span>
                    <span className="text f-14 flex-auto bold">{getPageText(pa)}</span>
                    <span className="flex-fixed remark f-12">{util.showTime(r.editDate || r.createDate)}</span>
                </div>
                <div className="text-1 f-12 l-20"
                    dangerouslySetInnerHTML={{ __html: r.content }}></div>
            </div>
        })
    }
    renderRecent() {
        return <div>
            {this.ws?.aiConfig?.aiSearch && <div onMouseDown={e => this.openAi(e)} className={" flex gap-w-5 padding-w-5  h-30 round cursor " + (this.index == -1 ? "item-hover-focus" : "item-hover")}>
                <span className="size-24 flex-center flex-fixed "><Icon className={'text-pu'} size={18} icon={AiStartSvg}></Icon></span>
                <span className="flex-auto">{lst('在{text}中AI搜索', { text: this.ws?.text || lst('空间') })}</span>
            </div>}
            <div className="padding-w-5  gap-w-5">
                <span className="remark f-12"><S>最近访问</S></span>
                <span className="flex-auto"></span>
            </div>
            {
                this.recentItems.map((r, i) => {
                    return <div key={r.id} className={"gap-w-5 gap-h-3 cursor "} onMouseDown={e => this.onSelect(r)}>
                        <div className={"flex none-hover  padding-w-5  round  h-30 " + (this.index == i ? "item-hover-focus" : "item-hover")}>
                            <span className="flex-fixed flex-line flex-center size-20 round remark gap-r-5"><Icon size={18} icon={getPageIcon(r)}></Icon></span>
                            <span className="flex-fixed  text f-14 bold max-w-300 text-overflow">{getPageText(r)}</span>
                            <span className="flex-auto text-overflow gap-w-5 flex">
                                {this.renderParents(r)}
                            </span>
                            <span className="flex-fixed none f-12 remark">{UA.isMacOs ? <Icon size={14} icon={{ name: 'byte', code: 'corner-down-left' }}></Icon> : "enter"}</span>
                            <span className="flex-fixed none-visible f-12 remark">{util.showTime(r.editDate || r.createDate)}</span>
                        </div>
                    </div>
                })
            }
        </div>
    }
    renderParents(item: LinkPageItem) {
        var parents = item.parents;
        if (!parents) return null;
        return parents.map((r, i) => {
            return <span key={r.id}>
                <span className="remark f-12">{getPageText(r)}</span>
                {i < parents.length - 1 && <span className="temark inline-block gap-w-3 f-12">/</span>}
            </span>
        })
    }
    el: HTMLElement;
    ws
    async open(options?: { ws?: any, word?: string }) {
        if (options?.word) this.searchList.word = options?.word;
        else this.searchList.word = '';

        this.ws = options.ws;
        await this.loadRecent();
        if (this.searchList.word) {
            await this.onForceSearch()
        }
        this.forceUpdate(() => {
            if (this.searchInput) this.searchInput.focus()
        });
    }
    async onSelect(item: LinkPageItem) {
        channel.act('/page/open', { item: item.id });
        this.emit('save', item);
    }
    index: number = 0;
    recentItems: LinkPageItem[] = [];
    async loadRecent() {
        var r = await channel.query('/page/recently/viewed', { wsId: this.ws?.id });
        var items: LinkPageItem[] = [];
        r.items.forEach(c => {
            if (items.some(s => s.id == c.id)) return;
            items.push(c);
        })

        this.recentItems = items;
    }
    searchList: SearchListType<{ id: string, creater: string, score?: string,createDate?:Date,editDate?:Date, title?: string, content: string }, { isOnlySearchTitle?: boolean, editDate?: number, createDate?: number, pages: LinkPageItem[] }> = { editDate: -1, createDate: null, isOnlySearchTitle: false, loading: false, list: [], pages: [], total: 0, page: 1, size: 20 };
    onForceSearch = async () => {
        if (this.searchList.word) {
            this.searchList.loading = true;
            this.forceUpdate();
            try {
                var r = await channel.get('/ws/search', {
                    word: this.searchList.word,
                    ws: this.ws,
                    editDate: typeof this.searchList.editDate == 'number' ? this.searchList.editDate : undefined,
                    createDate: typeof this.searchList.createDate == 'number' ? this.searchList.createDate : undefined,
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
    async openAi(e?: React.MouseEvent) {
        this.emit('close');
        useAISearchBox({ ws: this.ws, word: this.searchList.word })
    }
    abledAi(e: React.MouseEvent) {

    }
}

export async function useSearchBox(options: { ws: any, word?: string }) {
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