import lodash from "lodash";
import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
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
        return <div className="shy-search-box">
            <div className="shy-search-box-head">
                <div className="shy-search-box-head-input"><Input value={this.word} onChange={this.onSearch} ></Input></div>
                <div className="shy-search-box-head-operators">
                </div>
            </div>
            <div className="shy-search-box-content">
                {this.loading && <Loading></Loading>}
                {!this.loading && this.word && this.renderList()}
                {!this.word && this.renderViews()}
            </div>
        </div>
    }
    renderViews() {
        return this.myPages.map(r => {
            return <div key={r.id} className="shy-search-box-item" onMouseDown={e => this.onSelect(r)}>
                <a>
                    <Icon icon={r.icon}></Icon>
                    <span>{r.text}</span>
                </a>
            </div>
        })
    }
    renderList() {
        return this.list.map(r => {
            return <div key={r.id} className="shy-search-box-item" onMouseDown={e => this.onSelect(r)}>
                <a>
                    <span>{r.title}</span>
                    <div>{r.content}</div>
                </a>
            </div>
        })
    }
    el: HTMLElement;
    word: string = '';
    isNav: boolean = false;
    async open(options?: { word: string, isNav?: boolean }) {
        if (options?.word) this.word = options?.word;
        else this.word = '';
        if (options.isNav) this.isNav = true;
        else this.isNav = false;
        this.myPages = channel.query('/ws/current/pages');
    }
    async onSelect(item) {
        if (this.isNav == true) {

        }
        this.emit('save', item);
    }
    myPages: LinkPageItem[] = [];
    list: { id: string, creater: string, score?: string, title?: string, content: string }[] = [];
    loading: boolean = false;
    total = 0;
    page = 1;
    size = 20;
    onSearch = lodash.debounce(async () => {
        var r = await channel.get('/ws/search', { word: this.word });
        if (r.ok) {
            this.list = r.data.list as any;
            this.total = r.data.total;
        }
    }, 1000)
}

export async function useSearchBox(options?: { word: string, isNav?: boolean }) {
    var pos: PopoverPosition = { center: true };
    let popover = await PopoverSingleton(SearchBox, { mask: true, });
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