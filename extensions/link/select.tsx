import lodash from "lodash";
import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Icon } from "../../component/view/icon";
import { Input } from "../../component/view/input";
import { channel } from "../../net/channel";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { Spin } from "../../component/view/spin";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";
import { popoverLayer } from "../../component/lib/zindex";
import { lst } from "../../i18n/store";

/**
 * 
 * 输入网址，
 * 如果不是互联网址，则搜索本地的页面，同时也可以根据当前的输入的页面名称，自动创建一个新的子页面
 * 
 */
class SelectWorkspacePage extends EventsComponent {
    constructor(props) {
        super(props);
    }
    word: string = '';
    currentLinks: LinkPageItem[];
    links: LinkPageItem[] = [];
    loading = false;
    isSearch = false;
    syncSearch = lodash.debounce(async () => {
        this.forceSyncSearch();
    }, 1200)
    forceSyncSearch = async () => {
        this.loading = true;
        this.forceUpdate();
        var r = await channel.get('/page/word/query', { word: this.word, ws: null });
        this.isSearch = true;
        if (r.ok) {
            this.links = r.data.list;
        }
        else this.links = [];
        this.loading = false;
        this.forceUpdate(() => {
            this.emit('update')
        });
    }
    selectIndex = 0;
    el: HTMLElement;
    render() {
        return <div ref={e => this.el = e} style={{ zIndex: popoverLayer.zoom(this) }} className='pos-fixed bg-white w-250 max-h-300 overlay-y padding-w-10 padding-t-10 padding-b-40 round shadow'>
            <div className="gap-b-10"><Input size='small'
                placeholder={lst('搜索页面')}
                onChange={e => { this.word = e; this.syncSearch() }}
                onEnter={(e, g) => { this.word = e; this.forceSyncSearch() }}
                value={this.word}></Input>
            </div>
            {!this.word && this.currentLinks && this.currentLinks.map((link, i) => {
                return <a onMouseUp={e => this.onSelect(link)} className={"h-30 text  item-hover cursor round padding-w-10 flex" + ((i) == this.selectIndex ? " item-hover-focus" : "")} key={link.id}>
                    <span className="flex flex-inline flex-center size-24 item-hover round flex-fixed"><Icon size={20} icon={getPageIcon(link)}></Icon></span> <span className="f-14 flex-auto text-overflow">{getPageText(link)}</span></a>
            })}
            {this.loading && <div className="gap-h-10 flex-center"><Spin></Spin></div>}
            {this.word && this.links && this.links.map((link, i) => {
                return <a onMouseUp={e => this.onSelect(link)} className={"h-30  text  item-hover cursor round padding-w-10 flex" + ((i) == this.selectIndex ? " item-hover-focus" : "")} key={link.id}>
                    <span className="flex flex-inline size-24 flex-center item-hover round flex-fixed"><Icon size={20} icon={getPageIcon(link)}></Icon></span> <span className="f-14 flex-auto text-overflow">{getPageText(link)}</span></a>
            })}
        </div>
    }
    onSelect(link: LinkPageItem) {
        this.emit('change', link)
    }
    async onOpen() {
        if (!this.currentLinks) {
            this.currentLinks = await channel.query('/ws/current/pages');
            this.forceUpdate(() => {
                this.emit('update')
            });
        }
    }
}

export async function useSelectWorkspacePage(pos: PopoverPosition) {
    var popover = await PopoverSingleton(SelectWorkspacePage, {});
    var picker = await popover.open(pos);
    await picker.onOpen();
    return new Promise((resolve: (link: LinkPageItem) => void, reject) => {
        picker.on('change', (link: LinkPageItem) => {
            resolve(link);
            popover.close();
        })
        picker.on('update', () => {
            popover.updateLayout();
        })
        popover.on('close', () => resolve(null))
    })
}