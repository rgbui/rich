import React from "react";
import { Input } from "../../component/view/input";
import { LangID } from "../../i18n/declare";

import { langProvider } from "../../i18n/provider";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { PageLink } from "./declare";
import { GlobalLinkSvg, PageSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { LinkPageItem } from "../at/declare";
import lodash from "lodash";
import { channel } from "../../net/channel";
import "./style.less";
import { Loading } from "../../component/view/loading";
import { Remark } from "../../component/view/text";
import { Divider } from "../../component/view/grid";

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
    onEnter(url) {
        if (url.startsWith('https://') || url.startsWith('http://')) {
            this.emit('change', { url, name: 'outside' });
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
    loading = false;
    isSearch = false;
    syncSearch = lodash.debounce(async () => {
        this.forceSyncSearch();
    }, 1200)
    forceSyncSearch = async () => {
        if (!this.url) return;
        this.loading = true;
        this.forceUpdate();
        var r = await channel.get('/page/word/query', { word: this.url });
        this.isSearch = true;
        if (r.ok) {
            this.links = r.data.list;
        }
        else this.links = [];
        this.loading = false;
        this.forceUpdate();
    }
    render() {
        return <div className='shy-link-picker'>
            <Input size='small'
                placeholder={langProvider.getText(LangID.PleashInputLinkAndSearchPages)}
                onChange={e => this.onInput(e)}
                onEnter={(e, g) => { g.preventDefault(); g.stopPropagation(); this.onEnter(e); }}
                value={this.url}></Input>
            <div className='shy-link-picker-current-page'>
                {this.name == 'outside' && this.url && <a onClick={e => this.onEnter(this.url)}><Icon size={16} icon={GlobalLinkSvg}></Icon><span>{this.url}</span></a>}
            </div>
            {this.name == 'page' && this.url && <><div onClick={e => this.onCreate()} className='shy-link-picker-operators'>
                <span>创建<em>{this.url}</em></span>
            </div><Divider></Divider></>}
            {this.name == 'page' && <div className='shy-link-picker-search-pages'>
                {this.loading && <Loading></Loading>}
                {!this.loading && this.links.map((link, i) => {
                    return <a onClick={e => this.onSelect(link)} className={"shy-page-link-item"} key={link.id}><Icon icon={link.icon || PageSvg}></Icon><span>{link.text || '新页面'}</span></a>
                })}
                {!this.loading && this.links.length == 0 && this.isSearch && <a><Remark>没有搜索到</Remark></a>}
            </div>}
        </div>
    }
    onSelect(link: LinkPageItem) {
        this.emit('change', { name: 'page', pageId: link.id })
    }
    onCreate() {
        this.emit('change', { name: 'create', url: this.url })
    }
    async onOpen(link: PageLink) {
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
    var popover = await PopoverSingleton(LinkPicker, {}, { link: link });
    var picker = await popover.open(pos);
    await picker.onOpen(link);
    return new Promise((resolve: (link: PageLink) => void, reject) => {
        picker.on('change', (link: PageLink) => {
            resolve(link);
            popover.close();
        })
        popover.on('close', () => resolve(null))
    })
}