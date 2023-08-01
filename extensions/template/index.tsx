import React from "react";
import { PageSvg } from "../../../shy/src/component/svgs";
import { EventsComponent } from "../../component/lib/events.component";
import { SearchListType } from "../../component/types";
import { Avatar } from "../../component/view/avator/face";
import { Button } from "../../component/view/button";
import { Icon } from "../../component/view/icon";
import { ToolTip } from "../../component/view/tooltip";
import { getElementUrl, ElementType, autoImageUrl } from "../../net/element.type";
import { PageTemplateTypeGroups } from "../../src/page/declare";
import { ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../popover/popover";
import { CubesSvg, ChevronDownSvg, ChevronLeftSvg, CollectTableSvg, TopicSvg, DocCardsSvg } from "../../component/svgs";
import { channel } from "../../net/channel";
import { PageContentView } from "../page";
import { S } from "../../i18n/view";
import { lst } from "../../i18n/store";

export interface PageTemplateType {
    id: string,
    text: string,
    classify: string,
    descrption: string,
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

export class TemplateView extends EventsComponent<{ isOrg?: boolean }> {
    renderSide() {
        return <div
            style={{
                backgroundColor: 'var(--background-secondary)'
            }}
            className="flex-fixed w-200 padding-10 overflow-y">
            <div className="bold flex h-30 border-bottom remark gap-b-10">
                <span className="flex-fixed size-24 flex-center"><Icon size={20} icon={CubesSvg}></Icon></span>
                <span className="flex-auto"><S>模板</S></span>
            </div>
            {this.typeGroups.map((tg, i) => {
                if (tg.visible === false) return <div key={i}></div>
                return <div className="gap-b-10" key={i}>
                    <div onClick={e => {
                        tg.spread = tg.spread ? false : true;
                        this.forceUpdate();
                    }} className="f-14 bold flex remark cursor">
                        <span className={"size-12 cursor flex-center ts " + (tg.spread !== false ? " " : " angle-90-")}><Icon size={12} icon={ChevronDownSvg}></Icon></span>
                        <span className="size-24 item-hover flex-center flex-fixed"><Icon size={18} icon={tg.icon}></Icon></span>
                        <span className="flex-fixed">{tg.text}</span>
                    </div>
                    {tg.spread && <div>
                        {tg.childs.map((c, k) => {
                            if (c.visible == false) return <div key={k}></div>
                            return <div key={k}
                                onMouseDown={e => {
                                    if (this.templateList.type == c.text)
                                        this.templateList.type = '';
                                    else this.templateList.type = c.text;
                                    this.onSearch();
                                }}
                                className={"h-30 flex round cursor item-hover-light padding-l-40 padding-r-10" + (this.templateList.type == c.text ? " item-hover-focus" : "")}>{c.text}</div>
                        })}
                    </div>}
                </div>
            })}
        </div>
    }
    typeGroups = PageTemplateTypeGroups;
    setMime(mime) {
        if (this.templateList.mime == mime) this.templateList.mime = '';
        else this.templateList.mime = mime;
        this.onSearch()
    }
    renderContent() {
        if (this.currentPageTemplate) {
            return <div className="flex-auto relative flex flex-col flex-full">
                <div className="flex-fixed h-40 border-bottom flex gap-l-10">
                    <ToolTip overlay={lst('返回')}><span className="flex-fixed size-24 item-hover cursor round flex-center" onClick={e => {
                        this.currentPageTemplate = null;
                        this.forceUpdate();
                    }}><Icon size={20} icon={ChevronLeftSvg}></Icon></span></ToolTip>
                    <span className="flex-fixed bold f-14 max-w-180 text-overflow">{this.currentPageTemplate?.text}</span>
                    <span className="flex-auto flex-end gap-r-10">
                        {!this.props.isOrg && <Button onClick={e => this.onPreview(this.currentPageTemplate)}><S>使用模板</S></Button>}
                    </span>
                </div>
                <div className="relative flex-auto">
                    <PageContentView
                        wsId={this.currentPageTemplate.sourceWorkspaceId}
                        elementUrl={this.currentPageTemplate.sourceElementUrl ? this.currentPageTemplate.sourceElementUrl : getElementUrl(ElementType.PageItem, this.currentPageTemplate.sourcePageId)}
                    ></PageContentView>
                </div>
            </div>
        }
        return <div className="flex-auto overflow-y padding-r-10">
            <div className="flex r-flex-center f-16 r-gap-10 r-padding-w-10 r-padding-h-5 r-round r-cursor r-item-hover ">
                <span className={this.templateList.mime == 'page' ? "item-hover-focus" : ""} onMouseDown={e => {
                    this.setMime('page')
                }}><Icon icon={PageSvg}></Icon><em><S>页面</S></em></span>
                <span className={this.templateList.mime == 'db' ? "item-hover-focus" : ""} onMouseDown={e => { this.setMime('db') }}><Icon icon={CollectTableSvg}></Icon><em><S>数据表格</S></em></span>
                <span className={this.templateList.mime == 'channel' ? "item-hover-focus" : ""} onMouseDown={e => { this.setMime('channel') }}><Icon icon={TopicSvg}></Icon><em><S>频道</S></em></span>
                <span className={this.templateList.mime == 'ppt' ? "item-hover-focus" : ""} onMouseDown={e => { this.setMime('ppt') }}><Icon icon={DocCardsSvg}></Icon><em><S>宣传页</S></em></span>
            </div>
            <div className="flex flex-start flex-wrap">
                {this.templateList.list.map(tl => {
                    return <div key={tl.id} onClick={e => { this.onPreview(tl) }} className="w33-10  box-border visible-hover gap-l-10 gap-b-10 round">
                        <div className="relative border  round  ">
                            <img className="w100 h-180 object-center" src={autoImageUrl(tl.previewCover?.url, 500)} />
                            <div className="pos-bottom-full visible flex-end r-gap-l-10">
                                <Button onClick={e => this.onPreview(tl)}><S>预览</S></Button>
                                {!this.props.isOrg && <Button onClick={e => { e.stopPropagation(); this.onSelect(tl); }}><S>使用</S></Button>}
                            </div>
                        </div>
                        <div className="flex gap-t-10">
                            <span className="flex-auto bold f-14 text-overflow">{tl.text}</span>
                            <Avatar size={24} className="flex-fixed" userid={tl.userid}></Avatar>
                        </div>
                    </div>
                })}
            </div>
        </div>
    }
    templateList: SearchListType<PageTemplateType, { mime: string, tags: string[], type: string }> = { type: '', mime: 'page', loading: false, tags: [], total: 0, list: [], page: 1, size: 20 }
    async onSearch() {
        try {
            this.templateList.loading = true;
            this.forceUpdate();
            var rs = await channel.get('/search/workspace/template', {
                classify: this.templateList.type || undefined,
                tags: this.templateList.tags,
                mime: this.templateList.mime,
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
    async onSelect(pageTemplate: PageTemplateType) {
        await channel.post('/workspace/template/useCount', { id: pageTemplate.id });
        this.emit('save', pageTemplate);
    }
    render(): React.ReactNode {
        return <div className={this.props.isOrg ? "user-none padding-t-20" : "vw80-max min-w-1200 h-500 vh80-max user-none"}>
            <div className="flex flex-full h100">
                {this.renderSide()}
                {this.renderContent()}
            </div>
        </div>
    }
    open() {
        this.templateList = { type: '', mime: 'page', loading: false, tags: [], total: 0, list: [], page: 1, size: 20 }
        this.onSearch()
    }
    currentPageTemplate: PageTemplateType = null;
    onPreview(pageTemplate: PageTemplateType) {
        this.currentPageTemplate = pageTemplate;
        this.forceUpdate();
    }
    componentDidMount(): void {
        this.onSearch();
    }
}

export async function useTemplateView() {
    let popover = await PopoverSingleton(TemplateView, { mask: true, shadow: true });
    let fv = await popover.open({ center: true, centerTop: 100 });
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