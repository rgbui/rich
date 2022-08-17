import lodash from "lodash";
import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PageSvg } from "../../component/svgs";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { Input } from "../../component/view/input";
import { Loading } from "../../component/view/loading";
import { channel } from "../../net/channel";
import { LinkPageItem } from "../at/declare";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import "./style.less";

export class SearchBox extends EventsComponent {
    render() {
        return <div className="w-600  card padding-0">
            <div className="padding-10  h-30 flex-center">
                <Input clear onClear={() => { this.word = ''; this.onForceSearch() }} placeholder="搜索内容" value={this.word} onEnter={e => { this.word = e; this.onForceSearch() }} onChange={e => { this.word = e; this.onSearch() }} ></Input>
            </div>
            <Divider></Divider>
            <div className="padding-h-10 overflow-y max-h-300 min-h-200">
                {this.loading && <Loading></Loading>}
                {!this.loading && this.word && this.renderList()}
                {!this.word && this.renderViews()}
            </div>
        </div>
    }
    renderViews() {
        return this.myPages.map(r => {
            return <div key={r.id} className="flex h-30 padding-w-10 item-hover round cursor" onMouseDown={e => this.onSelect(r)}>
                <span className="flex-line flex-center size-20 round text gap-r-5  f-14"><Icon size={16} icon={r.icon || PageSvg}></Icon></span>
                <span className="text  f-14">{r.text || '新页面'}</span>
            </div>
        })
    }
    renderList() {
        if (this.list.length == 0) return <div className="h-30 flex-center remark">没有搜到页面</div>
        return this.list.map(r => {
            return <div key={r.id} className="padding-10 item-hover round cursor" onMouseDown={e => this.onSelect(r)}>
                <div className="flex">
                    <span className="flex-line flex-center size-20 round text gap-r-5"><Icon size={16} icon={r.icon || PageSvg}></Icon></span>
                    <span className="text f-14">{r.title || r.text || '新页面'}</span>
                </div>
                <div className="remark f-14">{r.content}</div>
            </div>
        })
    }
    el: HTMLElement;
    word: string = '';
    isNav: boolean = false;
    async open(options?: { word?: string, isNav?: boolean }) {
        if (options?.word) this.word = options?.word;
        else this.word = '';
        if (options?.isNav) this.isNav = true;
        else this.isNav = false;
        this.myPages = await channel.query('/ws/current/pages');
        if (this.word) {
            this.onSearch()
        }
        this.forceUpdate();
    }
    async onSelect(item: LinkPageItem) {
        if (this.isNav == true) {
            channel.air('/page/open', { item: { id: item.id } });
        }
        this.emit('save', item);
    }
    myPages: LinkPageItem[] = [];
    list: (LinkPageItem & { id: string, creater: string, score?: string, title?: string, content: string })[] = [];
    loading: boolean = false;
    total = 0;
    page = 1;
    size = 20;
    onForceSearch = async () => {
        if (this.word) {
            this.loading = true;
            this.forceUpdate();
            var r = await channel.get('/ws/search', { word: this.word });
            this.loading = false;
            if (r.ok) {
                this.list = r.data.list as any;
                this.total = r.data.total;
            }
            this.forceUpdate();
        }
        else this.forceUpdate()
    }
    onSearch = lodash.debounce(async () => {
        this.onForceSearch();
    }, 1000)
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