import React from "react";
import { Input } from "../../component/view/input";
import { LangID } from "../../i18n/declare";

import { langProvider } from "../../i18n/provider";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { PageLink } from "./declare";
import { GlobalLinkSvg, PageSvg, PlusSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import lodash from "lodash";
import { channel } from "../../net/channel";
import "./style.less";
import { Divider } from "../../component/view/grid";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";
import { Spin } from "../../component/view/spin";
import { popoverLayer } from "../../component/lib/zindex";
import { KeyboardCode } from "../../src/common/keys";
import { util } from "../../util/util";
import { Block } from "../../src/block";

/**
 * 
 * 输入网址，
 * 如果不是互联网址，则搜索本地的页面，同时也可以根据当前的输入的页面名称，自动创建一个新的子页面
 * 
 */
class LinkPicker extends EventsComponent {
    constructor(props) {
        super(props);
    }
    url: string = '';
    name: PageLink['name'];
    async onEnter(url) {
        if (url.startsWith('https://') || url.startsWith('http://')) {
            this.emit('change', { link: { url: url, name: 'outside' } });
        }
        else if (this.selectIndex == 0 && url) {
            await this.onCreate();
        }
        else if (this.selectIndex > 0) {
            var d = this.links[this.selectIndex - 1];
            if (d) {
                this.onSelect(d);
            }
        }
    }
    onInput(e: string) {
        /**
         * 说明是网址开头的
         */
        if (e && (e.startsWith('http://') || e.startsWith('https://'))) {
            this.name = 'outside';
            this.url = e;
            this.isSearch = false;
            this.links = [];
            this.forceUpdate();
        }
        else if (e) {
            //这里搜索
            this.name = 'page';
            this.url = e;
            this.isSearch = true;
            this.forceUpdate();
            if (this.url) this.syncSearch();
        }
        else {
            this.url = '';
            this.isSearch = false;
            this.links = [];
            this.forceUpdate();
        }
    }
    links: LinkPageItem[] = [];
    allLists: { list: LinkPageItem[], total: number, size: number } = { list: [], total: 0, size: 500 };
    loading = false;
    isSearch = false;
    syncSearch = lodash.debounce(async () => {
        this.forceSyncSearch();
    }, 1200)
    async searchAll() {
        var g = await channel.get('/page/word/query', { size: this.allLists.size });
        if (g.ok) {
            this.allLists = g.data;
        }
    }
    forceSyncSearch = async () => {
        if (!this.url) return;
        this.loading = true;
        this.forceUpdate();
        if (this.allLists.total < this.allLists.size && this.allLists.total > 0) {
            this.links = this.allLists.list.filter(l => l.text.startsWith(this.url));
        }
        else {
            var r = await channel.get('/page/word/query', { word: this.url });
            if (r.ok) {
                this.links = r.data.list;
            }
            else this.links = [];
        }
        this.isSearch = true;
        this.loading = false;
        this.forceUpdate();
    }
    el: HTMLElement;
    componentDidUpdate() {
        var el = this.el.querySelector('.item-hover-focus') as HTMLElement;
        if (el) {
            el.scrollIntoView({
                block: "nearest",
                inline: "nearest"
            });
        }
    }
    keydown = (event: React.KeyboardEvent<Element>) => {
        switch (event.key) {
            case KeyboardCode.ArrowDown:
                this.selectIndex += 1;
                return true;
            case KeyboardCode.ArrowUp:
                this.selectIndex -= 1;
                return true;
            case KeyboardCode.Enter:
                break;
        }
    }
    selectIndex = 0;
    render() {
        return <div ref={e => this.el = e} style={{ zIndex: popoverLayer.zoom(this) }} className='pos-fixed bg-white w-250 max-h-300 overlay-y padding-10 round shadow'>
            <div className="gap-h-5">
                <Input size='small'
                    onKeydown={this.keydown}
                    placeholder={langProvider.getText(LangID.PleashInputLinkAndSearchPages)}
                    onChange={e => this.onInput(e)}
                    onEnter={(e, g) => { g.preventDefault(); g.stopPropagation(); this.onEnter(e); }}
                    value={this.url}></Input>
            </div>
            {this.name == 'outside' && this.url && <div className={'h-30 item-hover round padding-w-5 flex' + (this.selectIndex == 0 ? " item-hover-focus" : "")}
                onClick={e => this.onEnter(this.url)}
            ><span className="size-24 flex-center item-hover"> <Icon size={16} icon={GlobalLinkSvg}></Icon></span>
                <span>{this.url}</span>
            </div>}
            {this.name == 'page' && this.url && <><div onClick={e => this.onCreate()} className={'h-30 item-hover round padding-w-5 flex' + (this.selectIndex == 0 ? " item-hover-focus" : "")}>
                <span className="flex-auto">创建<em className="bold">{this.url}</em></span>
                <span className="flex-fixed size-20 item-hover cursor round">
                    <Icon icon={PlusSvg} size={20}></Icon>
                </span>
            </div>
                <Divider></Divider></>}
            {this.name == 'page' && <div>
                {this.loading && <Spin></Spin>}
                {!this.loading && this.links.map((link, i) => {
                    return <div onClick={e => this.onSelect(link)} className={"h-30 item-hover round padding-w-5 flex" + (this.selectIndex == (i + 1) ? " item-hover-focus" : "")} key={link.id}>
                        <span className="size-20 flex-fixed flex-center item-hover round"><Icon icon={getPageIcon(link)}></Icon></span>
                        <span className="flex-auto">{getPageText(link)}</span>
                    </div>
                })}
                {!this.loading && this.links.length == 0 && this.isSearch && <span className="remark f-12 flex-center">没有搜索到</span>}
            </div>}
        </div>
    }
    onSelect(link: LinkPageItem) {
        this.emit('change', {
            refLinks: [{ type: 'page', id: util.guid(), pageId: link.id }]
        })
    }
    async onCreate() {
        var currentPage = await channel.query('/current/page');
        var r = await channel.air('/page/create/sub', {
            pageId: currentPage.id,
            text: this.url
        });
        if (r.id) this.emit('change', {
            refLinks: [{ type: 'page', id: util.guid(), pageId: r.id }],
        })
    }
    async onOpen(link: PageLink) {
        this.selectIndex = 0;
        await this.searchAll();
        if (link) {
            if (link.url) {
                this.url = link.url;
                this.name = 'outside';
                this.forceUpdate()
            }
            else if (link.pageId) {
                this.url = link.text;
                this.name = 'page';
                await this.forceSyncSearch();
            }
        }
        else {
            this.url = '';
            this.name = undefined;
            this.forceUpdate();
        }
    }
}

export async function useLinkPicker(pos: PopoverPosition, link?: PageLink) {
    var popover = await PopoverSingleton(LinkPicker, { mask: true }, { link: link });
    var picker = await popover.open(pos);
    await picker.onOpen(link);
    return new Promise((resolve: (link: PageLink & { refLinks: Block['refLinks'] }) => void, reject) => {
        picker.on('change', (link: PageLink & { refLinks: Block['refLinks'] }) => {
            resolve(link);
            popover.close();
        })
        popover.on('close', () => resolve(null))
    })
}