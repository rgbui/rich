
import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { channel } from "../../net/channel";
import { ElementType, getElementUrl } from "../../net/element.type";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import "./style.less";

export class PageHistoryStore extends EventsComponent {
    render() {
        return <div className="shy-page-history">
            <div className="shy-page-history-view"></div>
            <div className="shy-page-history-store-list">
                {this.list.map(r => {
                    return <a key={r.id}><span></span></a>
                })}
            </div>
        </div>
    }
    pageId: string;
    open(options?: { pageId: string }) {
        this.pageId = options.pageId;
    }
    list: { id: string, creater: string, createDate: Date }[] = [];
    async load() {
        var r = await channel.get('/view/snap/list', { elementUrl: getElementUrl(ElementType.PageItem, this.pageId), page: 1, size: 20 });
        if (r.ok) {
            this.list = r.data.list;
        }
    }
    async loadPageContent(id) {
        var r = await channel.get('/view/snap/content', { id });
        if (r.ok) {

        }
    }
}

export async function usePageHistoryStore(pos: PopoverPosition, options?: { pageId: string }) {
    let popover = await PopoverSingleton(PageHistoryStore, { mask: true });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (data: {
        text: string,
        url: string
    }) => void, reject) => {
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
