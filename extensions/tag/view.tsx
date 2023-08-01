import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import React from "react";
import { PopoverPosition } from "../popover/position";
import { PopoverSingleton } from "../popover/popover";
import { channel } from "../../net/channel";
import { SearchListType } from "../../component/types";
import { PageLink } from "../link/declare";
import { BlockRefPage } from "./ref.declare";
import { getPageIcon, getPageText } from "../../src/page/declare";
import { util } from "../../util/util";
import { Icon } from "../../component/view/icon";
import { TriangleSvg } from "../../component/svgs";
import { Spin } from "../../component/view/spin";
import { ElementType, getElementUrl, parseElementUrl } from "../../net/element.type";
import { Page } from "../../src/page";
import { S } from "../../i18n/view";

export class TagsView extends EventsComponent {
    constructor(props) {
        super(props)
    }
    render(): ReactNode {
        return <div className="padding-10 round w-400 max-h-300 overlay-y">
            <div className="h3">#{this.search.tag}</div>
            {this.search.loading && <div><Spin></Spin></div>}
            {this.renderRefs()}
        </div>
    }
    open(refPage: ArrayOf<BlockRefPage['childs']>) {
        var pe = parseElementUrl(refPage.elementUrl);
        channel.air('/page/open', {
            elementUrl: getElementUrl(ElementType.PageItem, pe.id),
            config: { blockId: pe.id1 }
        });
    }
    renderRefs() {
        if (this.search.refs.length == 0) {
            return <div className="flex-center remark f-12"><S>没有标签内容</S></div>
        }
        return this.search.refs.map(pa => {
            return <div key={pa.id} className='gap-h-10'>
                <div className="flex h-24 cursor" onMouseDown={e => { pa.spread = !pa.spread; this.forceUpdate() }} >
                    <span className="remark ts-transform flex-center size-16 cursor  round remark"
                        style={{ transform: pa.spread ? 'rotateZ(180deg)' : 'rotateZ(90deg)' }}><Icon size={10} icon={TriangleSvg}></Icon></span>
                    <span className="size-24 flex-center flex-inline"><Icon size={16} icon={getPageIcon(pa)}></Icon></span>
                    <span className="bold text">{getPageText(pa)}</span>
                </div>
                {pa.spread && <div className="gap-l-10">{pa.childs.map((b, i) => {
                    return <div onMouseDown={e => this.open(b)} key={b.id} className='text-1 gap-h-5  flex flex-top item-hover round padding-5 cursor'>
                        <span className="flex-fixed l-20">{i + 1}.</span>
                        <div className="flex-auto l-20 f-14" dangerouslySetInnerHTML={{ __html: b.html }}></div>
                        <span className="flex-fixed f-12 remark   l-20">{util.showTime(b.createDate)}</span></div>
                })}</div>}
            </div>
        })
    }
    async load() {
        this.search.loading = true;
        this.forceUpdate()
        var r = await channel.get('/get/tag/refs', {
            tagId: this.search.tagId || undefined,
            tag: this.search.tag || undefined,
            ws: this.page?.ws
        });
        if (r.ok) {
            this.search = Object.assign(this.search, r.data);
            this.search.refs = r.data.pages.map(c => {
                return {
                    ...c,
                    spread: false,
                    childs: r.data.list.findAll(g => g.pageId == c.id)
                }
            })
            this.search.loading = false;
            this.forceUpdate()
        }
    }
    search: SearchListType<{ id: string, creater: Date, html: string, pageId: string }, { pages: PageLink[], refs: BlockRefPage[], tagId: string, tag: string }> = {
        loading: false,
        total: 0,
        size: 300,
        page: 1,
        list: [],
        tag: '',
        tagId: '',
        pages: [],
        refs: []
    }
    page: Page;
    onOpen(link?: { tagId?: string, page: Page, tag?: string }) {
        this.search.tagId = link?.tagId || ''
        this.search.tag = link?.tag || ''
        this.page = link?.page;
        this.load()
    }
}

export async function useTagViewer(pos: PopoverPosition, link?: { tagId?: string, page: Page, tag?: string }) {
    var popover = await PopoverSingleton(TagsView, { mask: true }, { link: link });
    var picker = await popover.open(pos);
    await picker.onOpen(link);
    return new Promise((resolve: (reason?: any) => void, reject) => {

        popover.on('close', () => {
            resolve()
        })
    })
}