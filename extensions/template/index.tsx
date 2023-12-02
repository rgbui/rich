import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { SearchListType } from "../../component/types";
import { Button } from "../../component/view/button";
import { Icon } from "../../component/view/icon";
import { PageTemplateTypeGroups } from "../../src/page/declare";
import { IconArguments, ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../../component/popover/popover";
import { PageSvg } from "../../component/svgs";
import { channel } from "../../net/channel";
import { S } from "../../i18n/view";
import { Input } from "../../component/view/input";
import { ElementType, getElementUrl } from "../../net/element.type";
import { Avatar } from "../../component/view/avator/face";

export interface PageTemplateType {
    id: string,
    text: string,
    icon: IconArguments,
    classify: string,
    description: string,
    file: ResourceArguments,
    type: 'page' | 'workspace',
    previewCover: ResourceArguments,
    tags: string[],
    mime: 'page' | 'db' | 'channel' | 'ppt',
    useCount?: number,
    creater?: string,
    userid?: string,
    sourceWorkspaceId?: string,
    sourcePageId?: string,
    sourceElementUrl?: string
}

export class TemplateView extends EventsComponent {
    renderSide() {
        return <div
            style={{
                backgroundColor: 'var(--background-secondary)'
            }}
            className="flex-fixed w-200 padding-10 overflow-y border-right">
            <div className="bold flex h-30 remark gap-b-10">
                <span className="flex-fixed size-24 flex-center"><Icon size={20} icon={{ name: 'bytedance-icon', code: 'oval-love' }}></Icon></span>
                <span className="flex-auto"><S>模板</S></span>
            </div>
            <div className="gap-h-5">
                <Input clear value={this.templateList.word} onEnter={e => {
                    this.templateList.word = e;
                    this.onSearch();
                }} onClear={() => {
                    this.templateList.word = '';
                    this.onSearch();
                }} onChange={e => {
                    this.templateList.word = e;
                }}
                ></Input>
            </div>
            {this.typeGroups.map((tg, i) => {
                var ts = this.templateList.list.findAll(g => g.classify == tg.text);
                if (ts.length == 0) return <div key={i}></div>
                return <div className="gap-b-10 gap-t-20" key={i}>
                    <div onClick={e => {
                        tg.spread = tg.spread ? false : true;
                        this.forceUpdate();
                    }} className="f-12 flex remark cursor padding-w-10">
                        <span className="flex-fixed">{tg.text}</span>
                    </div>
                    <div>
                        {ts.map((tl, j) => {
                            return <div onMouseDown={e => {
                                this.onSetTemplate(tl);
                            }} className={"remark h-30 flex round cursor item-hover-light padding-w-10 " + (this.currentPageTemplate === tl ? " item-hover-focus" : "")} key={tl.id}>
                                <span className="flex-center size-24 rounc cursor flex-fixed"><Icon size={18} icon={tl.icon || PageSvg}></Icon></span><span className="gap-l-5 text-overflow flex-auto">{tl.text}</span>
                            </div>
                        })}
                    </div>
                </div>
            })}
        </div>
    }
    typeGroups = PageTemplateTypeGroups;
    templateList: SearchListType<PageTemplateType, { mime: string, tags: string[], type: string }> = { type: '', mime: 'page', loading: false, tags: [], total: 0, list: [], page: 1, size: 20 }
    async onSearch() {
        try {
            this.templateList.loading = true;
            this.forceUpdate();
            var rs = await channel.get('/search/workspace/template', {
                page: this.templateList.page,
                word: this.templateList.word,
                size: this.templateList.size
            });
            if (rs) {
                this.templateList.list = rs.data.list;
                this.templateList.page = rs.data.page;
                this.templateList.size = rs.data.size;
                this.templateList.total = rs.data.total;
            }
        }
        catch (ex) {

        }
        finally {
            this.templateList.loading = false;
            this.forceUpdate();
        }
    }
    iframe: HTMLIFrameElement;
    async onSetTemplate(pageTemplate: PageTemplateType) {
        this.currentPageTemplate = pageTemplate;
        if (!this.iframe.getAttribute('src')) {
            var su = pageTemplate.sourceElementUrl;
            if (!su) su = getElementUrl(ElementType.PageItem, this.currentPageTemplate.sourcePageId)
            var url = `/ws/${this.currentPageTemplate.sourceWorkspaceId}/r?url=` + encodeURIComponent(su);
            url = url + "&accessWorkspace=embed";
            if (window.shyConfig?.isPro) {
                url = (window.shyConfig.isUS ? "https://shy.red" : 'https://shy.live') + url
            }
            this.iframe.setAttribute('src', url);
        }
        else {
            this.iframe.contentWindow.postMessage(JSON.stringify({ name: 'openPageByTemplate', data: pageTemplate }), "*");
        }
        this.forceUpdate();
    }
    async onSelect(pageTemplate: PageTemplateType) {
        await channel.post('/workspace/template/useCount', { id: pageTemplate.id });
        this.emit('save', pageTemplate);
    }
    renderContent() {
        return <div className="flex-auto relative flex flex-col flex-full">
            <div className="flex-auto">
                <iframe ref={e => this.iframe = e} className="w100 h100 no-border"></iframe>
            </div>
            {this.currentPageTemplate && <div className="flex-fixed flex border-top padding-20 ">
                <div className="flex-auto">
                    <div className="bold f-16">{this.currentPageTemplate.text}</div>
                    <div className="gap-h-10"><Avatar showName size={28} userid={this.currentPageTemplate.userid}></Avatar></div>
                    <div className="remark">{this.currentPageTemplate.description}</div>
                </div>
                <div className="flex-fixed">
                    <Button onClick={e => this.onSelect(this.currentPageTemplate)}><S>使用模板</S></Button>
                </div>
            </div>}
        </div>
    }
    render(): React.ReactNode {
        var w = window.innerWidth;
        var classList: string[] = ['h-700', 'max-vh80', 'user-none'];
        if (w > 1400) {
            classList.push('min-w-1200')
        }
        else classList.push('min-ww80');
        return <div className={classList.join(" ")}>
            <div className="flex flex-full h100">
                {this.renderSide()}
                {this.renderContent()}
            </div>
        </div>
    }
    open() {
        // this.templateList = { type: '', mime: 'page', loading: false, tags: [], total: 0, list: [], page: 1, size: 20 }
        // this.onSearch()
    }
    currentPageTemplate: PageTemplateType = null;
    componentDidMount(): void {
        this.load();
    }
    async load() {
        await this.onSearch();
        if (this.templateList.list.length > 0) {
            await this.onSetTemplate(this.templateList.list[0]);
        }
    }
}

export async function useTemplateView() {
    let popover = await PopoverSingleton(TemplateView, { mask: true, shadow: true });
    let fv = await popover.open({ center: true });
    fv.open();
    return new Promise((resolve: (pageTemplate: PageTemplateType) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        fv.only('save', (pageTemplate: PageTemplateType) => {
            popover.close();
            resolve(pageTemplate)
        })
        popover.only('close', () => {
            resolve(null);
        });
    })
}

