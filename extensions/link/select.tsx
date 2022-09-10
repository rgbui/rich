import lodash from "lodash";
import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Icon } from "../../component/view/icon";
import { Input } from "../../component/view/input";
import { Loading } from "../../component/view/loading";
import { channel } from "../../net/channel";
import { getPageIcon, LinkPageItem } from "../at/declare";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";

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
        var r = await channel.get('/page/word/query', { word: this.word });
        this.isSearch = true;
        if (r.ok) {
            this.links = r.data.list;
        }
        else this.links = [];
        this.loading = false;
        this.forceUpdate();
    }
    selectIndex = 0;
    render() {
        return <div className='shy-link-picker'>
            <div className="gap-b-10"><Input size='small'
                placeholder={'搜索页面'}
                onChange={e => { this.word = e; this.syncSearch() }}
                onEnter={(e, g) => { this.word = e; this.forceSyncSearch() }}
                value={this.word}></Input>
            </div>
            {!this.word && this.currentLinks && this.currentLinks.map((link, i) => {
                return <a onMouseUp={e => this.onSelect(link)} className={"h-30 gap-l-10 text  item-hover cursor round padding-w-10 flex" + ((i) == this.selectIndex ? " item-hover-focus" : "")} key={link.id}>
                    <span className="flex flex-inline size-24 item-hover round"><Icon size={14} icon={getPageIcon(link)}></Icon></span> <span className="f-14">{link.text || '新页面'}</span></a>
            })}
            {this.loading && <Loading></Loading>}
            {this.word && this.links && this.links.map((link, i) => {
                return <a onMouseUp={e => this.onSelect(link)} className={"h-30 gap-l-10 text  item-hover cursor round padding-w-10 flex" + ((i) == this.selectIndex ? " item-hover-focus" : "")} key={link.id}>
                    <span className="flex flex-inline size-24 item-hover round"><Icon size={14} icon={getPageIcon(link)}></Icon></span> <span className="f-14">{link.text || '新页面'}</span></a>
            })}
        </div>
    }
    onSelect(link: LinkPageItem) {
        this.emit('change', link)
    }
    async onOpen() {
        if (!this.currentLinks) {
            this.currentLinks = await channel.query('/ws/current/pages');
            this.forceUpdate();
        }
    }
}

export async function useSelectWorkspacePage(pos: PopoverPosition) {
    var popover = await PopoverSingleton(SelectWorkspacePage, {});
    var picker = await popover.open(pos);
    await picker.onOpen();
    return new Promise((resolve: (link: LinkPageItem) => void, reject) => {
        picker.on('change', (link: LinkPageItem) => {
            console.log(link, 'ggg');
            resolve(link);
            popover.close();
        })
        popover.on('close', () => resolve(null))
    })
}