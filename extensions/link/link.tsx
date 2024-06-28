import React from "react";
import { Input } from "../../component/view/input";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { PageLink } from "./declare";
import { CheckSvg, GlobalLinkSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import lodash from "lodash";
import { channel } from "../../net/channel";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";
import { Spin } from "../../component/view/spin";
import { popoverLayer } from "../../component/lib/zindex";
import { KeyboardCode } from "../../src/common/keys";
import { SearchListType } from "../../component/types";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { Button } from "../../component/view/button";
import "./style.less";
import { DivInput } from "../../component/view/input/div";
import { IconArguments } from "../icon/declare";
import { TextEle } from "../../src/common/text.ele";

/**
 * 
 * 
 */
class LinkEditor extends EventsComponent {
    constructor(props) {
        super(props);
    }
    url: string = '';
    text: string = '';
    name: PageLink['name'];
    pageId: string;
    pageIcon?: IconArguments;
    async onEnter(url) {
        if (url.startsWith('https://') || url.startsWith('http://')) {
            this.name = 'outside';
            this.url = url;
            this.spread = false;
            this.forceUpdate();
        }
        else {
            var d = this.links[this.selectIndex];
            if (d) {
                this.onSelect(d);
            }
            else {
                this.spread = false;
                this.forceUpdate();
            }
        }
    }
    onInput(e: string) {
        this.spread = true;
        /**
         * 说明是网址开头的
         */
        if (e && (e.startsWith('http://') || e.startsWith('https://'))) {
            this.name = 'outside';
            this.spread = false;
            this.url = e;
            this.forceUpdate();
        }
        else if (e) {
            //这里搜索
            // this.name = 'page';
            this.url = e;
            this.isSearch = true;
            this.forceUpdate();
            if (this.url) this.syncSearch();
        }
        else {
            this.selectIndex = 0;
            this.name = 'none';
            this.url = '';
            this.isSearch = false;
            this.links = [];
            this.forceUpdate();
        }
    }
    spread: boolean = false;
    links: LinkPageItem[] = [];
    allLists: SearchListType<LinkPageItem> = { list: [], page: 1, total: 0, size: 500 };
    loading = false;
    isSearch = false;
    syncSearch = lodash.debounce(async () => {
        this.forceSyncSearch();
    }, 1200)
    async searchAll() {
        var g = await channel.get('/page/word/query', { size: this.allLists.size, ws: undefined });
        if (g.ok) {
            this.allLists = g.data;
            this.links = this.allLists.list;
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
            var r = await channel.get('/page/word/query', { word: this.url, ws: undefined });
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
                if (this.selectIndex >= this.links.length) { } this.selectIndex = this.links.length - 1;
                return true;
            case KeyboardCode.ArrowUp:
                this.selectIndex -= 1;
                if (this.selectIndex < 0) this.selectIndex = 0;
                return true;
            case KeyboardCode.Enter:
                break;
        }
    }
    selectIndex = 0;
    linkEl: HTMLElement;
    renderLink() {
        return <div className="relative" ref={e => this.linkEl = e}>
            <div className="flex border round padding-w-5 " style={{ height: 26 }} onMouseDown={e => {
                this.spread = true;
                this.forceUpdate()
            }}>
                {['page', 'outside'].includes(this.name) && <div className="flex-fixed size-24 round item-hover flex-center">
                    {this.name == 'outside' && <Icon size={16} icon={GlobalLinkSvg}></Icon>}
                    {this.name == 'page' && <Icon size={16} icon={getPageIcon({ icon: this.pageIcon })}></Icon>}
                </div>}
                <div className="flex-auto">
                    <DivInput
                        rf={e => this.divInput = e}

                        onKeyDown={this.keydown}
                        placeholder={lst('搜索网址或页面...')}
                        onInput={e => this.onInput(e)}
                        onEnter={(e) => {
                            this.onEnter(e);
                        }}
                        value={this.url}
                    ></DivInput>
                </div>
            </div>

            <div className="pos shadow-s border-light overflow-y max-h-300 bg-white round padding-t-10" style={{ display: this.spread && this.url ? "block" : 'none', bottom: 30, left: 0, right: 0 }}>
                {(this.url.startsWith('http://') || this.url.startsWith('https://')) && <div className={'h-30  gap-b-10 cursor item-hover round gap-w-5 padding-w-5 flex' + (this.selectIndex == 0 ? " item-hover-focus" : "")}
                    onClick={e => {
                        this.onEnter(this.url)
                    }}
                ><span className="size-24 flex-center item-hover flex-fixed"><Icon size={16} icon={GlobalLinkSvg}></Icon></span>
                    <span className="text-overflow flex-auto">{this.url}</span>
                </div>}
                {!(this.url.startsWith('http://') || this.url.startsWith('https://')) && <div className="gap-b-10">
                    {this.loading && <div className="flex-center"><Spin></Spin></div>}
                    {!this.loading && this.links.map((link, i) => {
                        return <div onClick={e => this.onSelect(link)} className={"h-30 cursor item-hover round  gap-w-5  padding-w-5 flex" + (this.selectIndex == i ? " item-hover-focus" : "")} key={link.id}>
                            <span className="size-20 flex-fixed flex-center item-hover round"><Icon size={16} icon={getPageIcon(link)}></Icon></span>
                            <span className="flex-auto text-overflow">{getPageText(link)}</span>
                            <div className="flex-fixed">
                                {this.name == 'page' && this.pageId == link.id && <Icon size={16} icon={CheckSvg}></Icon>}
                            </div>
                        </div>
                    })}
                    {!this.loading && this.links.length == 0 && this.isSearch && <span className="remark f-12 flex-center"><S>没有搜索到</S></span>}
                </div>}
            </div>
        </div>
    }
    render() {
        return <div
            ref={e => this.el = e}
            style={{ zIndex: popoverLayer.zoom(this) }}
            className=' w-350  padding-h-10  '>
            <div className="gap-w-10" >
                <div className="remark f-12 gap-b-3"><S>链接</S></div>
                <div>
                    {this.renderLink()}
                </div>
            </div>
            <div className="gap-10">
                <div className="remark f-12 gap-b-3"><S>链接标题</S></div>
                <Input value={this.text} onChange={e => { this.text = e }} ></Input>
            </div>
            <div className="flex border-top padding-w-10 padding-t-10">
                <div className="flex-auto"></div>
                <Button onMouseDown={e => { this.onClear() }} className="gap-r-10" ghost><S>取消</S></Button>
                <Button onMouseDown={e => { this.onSave() }}>确认</Button>
            </div>
        </div>
    }
    divInput: HTMLElement;
    onSelect(link: LinkPageItem) {
        this.pageId = link.id;
        this.url = link.text;
        this.pageIcon = link.icon;
        this.name = 'page';
        this.spread = false;
        this.forceUpdate(() => {
            if (this.divInput) {
                TextEle.setElCursor(this.divInput, { end: true })
            }
        });
    }
    async onOpen(link: PageLink) {
        this.selectIndex = 0;
        this.spread = false;
        await this.searchAll();
        if (link) {
            if (link.pageId) {
                this.text = link.text;
                this.pageId = link.pageId
                this.name = 'page';
                this.selectIndex = this.links.findIndex(g => g.id == link.pageId);
                this.url = this.links[this.selectIndex]?.text || '';
                this.pageIcon = this.links[this.selectIndex]?.icon;
                this.forceUpdate()
            }
            else if (link.url) {
                this.url = link.url;
                this.name = 'outside';
                this.text = link.text;
                this.forceUpdate()
            }
            else if (link.text) {
                this.url = '';
                this.text = link.text;
                this.forceUpdate()
            }
        }
    }
    onClear() {
        this.emit('clear');
    }
    onSave() {
        if (this.pageId) {
            this.emit('change', {
                text: this.text,
                pageId: this.pageId,
                name: this.name
            })
        }
        else {
            this.emit('change', {
                url: this.url,
                name: this.name,
                text: this.text
            })
        }
    }

    componentDidMount(): void {
        document.addEventListener('mousedown', this.globalMousedown)
    }
    componentWillUnmount(): void {
        document.removeEventListener('mousedown', this.globalMousedown);
    }
    globalMousedown = (event: MouseEvent) => {
        var t = event.target as HTMLElement;
        if (this.linkEl && this.linkEl.contains(t)) return;
        this.spread = false;
        this.forceUpdate();
    }
}

export async function useLinkEditor(pos: PopoverPosition, link?: PageLink) {
    var popover = await PopoverSingleton(LinkEditor, { mask: true }, { link: link });
    var picker = await popover.open(pos);
    await picker.onOpen(link);
    return new Promise((resolve: (g: PageLink) => void, reject) => {
        picker.on('change', (link: PageLink) => {
            resolve(lodash.cloneDeep(link));
            popover.close();
        })
        picker.on('clear', () => {
            resolve(null)
            popover.close();
        })
        popover.on('close', () => resolve(undefined))
    })
}