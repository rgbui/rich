import React from "react";
import { channel } from "../../net/channel";
import { LinkPageItem, LinkWs, getPageIcon, getPageText } from "../../src/page/declare";
import { util } from "../../util/util";
import { Icon } from "../../component/view/icon";
import { Spin } from "../../component/view/spin";
import { ChevronDownSvg, DotSvg } from "../../component/svgs";
import { Input } from "../../component/view/input";
import { SearchListType } from "../../component/types";
import lodash from "lodash";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";

/**
 * 目录树
 */
export class DirectoryTreeView extends React.Component<{
    ws: LinkWs,
    onSelect: (item: LinkPageItem) => void
}
>{
    renderTree(pages: LinkPageItem[], deep: number = 0) {
        return <div>
            {pages.map(pa => {
                if (pa.mime == 'pages' || pa.mime == 20) {
                    return <div key={pa.id}>
                        <div className="flex" onMouseDown={e => {
                            this.mousedownSpread(pa, e)
                        }} style={{ paddingLeft: deep * 20 }}>
                            <span className="flex-auto text-overflow f-14 remark">
                                <span className="item-hover cursor">{getPageText(pa)}</span>
                            </span>
                            <span className={"size-20 cursor round flex-center flex-fixed shy-ws-item-page-spread ts " + (pa.spread ? " " : " angle-90") + (false ? (" visible" + (pa.subCount == 0 ? '' : " item-hover")) : " item-hover")}>
                                {pa.willLoadSubs && <Spin></Spin>}
                                {!pa.willLoadSubs && (pa.subCount > 0 || pa?.childs?.length > 0) && <Icon size={16} icon={ChevronDownSvg}></Icon>}
                                {!pa.willLoadSubs && !((pa.subCount > 0 || pa?.childs?.length > 0)) && <Icon size={16} icon={DotSvg}></Icon>}
                            </span>
                        </div>
                        {pa.childs && pa.spread && this.renderTree(pa.childs, deep + 1)}
                    </div>
                }
                return <div key={pa.id}>
                    <div onMouseDown={e => this.onSelect(pa)} className="flex padding-h-3 cursor text-1  item-hover-light" style={{ paddingLeft: deep * 20 }}>
                        <span onMouseDown={e => {
                            this.mousedownSpread(pa, e)
                        }} className={"size-20 round flex-center flex-fixed shy-ws-item-page-spread ts " + (pa.spread ? " " : " angle-90-") + (false ? (" visible" + (pa.subCount == 0 ? '' : " item-hover")) : " item-hover")}>
                            {pa.willLoadSubs && <Spin></Spin>}
                            {!pa.willLoadSubs && (pa.subCount > 0 || pa?.childs?.length > 0) && <Icon size={16} icon={ChevronDownSvg}></Icon>}
                            {!pa.willLoadSubs && !((pa.subCount > 0 || pa?.childs?.length > 0)) && <Icon size={16} icon={DotSvg}></Icon>}
                        </span>
                        <span className="flex-fixed flex-center size-20 round item-hover"><Icon size={18} icon={getPageIcon(pa)}></Icon></span>
                        <span className="flex-auto text-overflow ">{getPageText(pa)}</span>
                    </div>
                    {pa.childs && pa.spread && this.renderTree(pa.childs, deep + 1)}
                </div>
            })}
        </div>
    }
    async mousedownSpread(pa: LinkPageItem, e: React.MouseEvent) {
        e.stopPropagation()
        if (pa.checkedHasChilds) {
            pa.spread = !pa.spread;
            this.forceUpdate();
            return;
        }
        else {
            var sus = await channel.get('/page/item/subs', { ws: this.props.ws, id: pa.id });
            if (sus.ok == true) {
                pa.childs = sus.data.list;
                pa.spread = false;
            }
            pa.checkedHasChilds = true;
        }
    }
    async load() {
        var rr = await channel.get('/page/items', { ids: undefined, ws: this.props.ws });
        if (rr) {
            if (Array.isArray(rr?.data?.list)) {
                var pages = rr.data.list;
                pages.sort((x, y) => {
                    if (x.at > y.at) return 1;
                    else if (x.at == y.at) return 0;
                    else return -1;
                })
                this.pages = util.flatArrayConvertTree(pages);
                this.pages.arrayJsonEach('childs', p => {
                    p.spread = true;
                    if (p.childs?.length > 0) p.checkedHasChilds = true;
                })
                this.forceUpdate()
            }
        }
    }
    pages: LinkPageItem[] = [];
    componentDidMount(): void {
        this.load();
    }
    search: SearchListType<LinkPageItem> = {
        loading: false,
        page: 1,
        size: 20,
        word: '',
        list: [],
        total: 0
    }
    searchList = lodash.debounce(async () => {
        await this.forceSearch()
    }, 1000)
    async forceSearch() {
        this.search.loading = true;
        this.forceUpdate();
        if (this.search.word) {
            var r = (await channel.get('/page/word/query', { word: this.search.word, ws: this.props.ws })).data.list;
            this.search.list = r;
        }
        else this.search.list = [];
        this.search.loading = false;
        this.forceUpdate();
    }
    render() {
        return <div>
            <div className="gap-h-10">
                <Input placeholder={lst("搜索...")}
                    clear
                    value={this.search.word}
                    onChange={e => {
                        this.search.word = e;
                        this.searchList();
                    }}
                    onEnter={e => {
                        this.search.word = e;
                        this.forceSearch()
                    }}
                    onClear={() => {
                        this.search.word = '';
                        this.forceSearch();

                    }}></Input>
            </div>
            {!this.search.word && <div>{this.renderTree(this.pages)}</div>}
            {this.search.word && this.renderSearch()}
        </div>
    }
    renderSearch() {
        if (this.search.loading) return <div>
            <Spin></Spin>
        </div>
        else {
            return <div>
                {this.search.list.map(pa => {
                    return <div className="flex padding-h-3 cursor text-1  item-hover-light" onMouseDown={e => {
                        this.search.word = '';
                        this.forceUpdate();
                        this.onSelect(pa)
                    }} key={pa.id}>
                        <span className="flex-fixed flex-center size-20 round item-hover"><Icon size={18} icon={getPageIcon(pa)}></Icon></span>
                        <span className="flex-auto text-overflow ">{getPageText(pa)}</span>
                    </div>
                })}
                {this.search.list.length == 0 && <div className="flex flex-center remark f-12 gap-h-10">
                    <S>没有搜索到任何页面</S>
                </div>}
            </div>
        }
    }
    onSelect(item: LinkPageItem) {
        this.props.onSelect(item);
    }
}