import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { SearchListType } from "../../component/types";
import { Button } from "../../component/view/button";
import { Icon } from "../../component/view/icon";
import { PageTemplateTypeGroups } from "../../src/page/declare";
import { IconArguments, ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../../component/popover/popover";
import { ChevronDownSvg, PageSvg, SearchSvg } from "../../component/svgs";
import { channel } from "../../net/channel";
import { S } from "../../i18n/view";
import { Input } from "../../component/view/input";
import { ElementType, getElementUrl } from "../../net/element.type";
import { lst } from "../../i18n/store";
import lodash from "lodash";
import { SelectBox } from "../../component/view/select/box";

export interface PageTemplateType {
    id: string,
    text: string,
    icon: IconArguments,
    classify: string[],
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
                borderRadius: '3px 0px 0px 3px'
            }}
            className="flex-fixed flex bg-1 flex-col flex-full w-250 border-shadow-right">
            <div className="gap-w-10 gap-t-10">
                <SelectBox
                    border
                    value={this.templateList.type}
                    dropAlign="full"
                    onChange={e => {
                        this.templateList.type = e;
                        this.onSearch();
                    }}
                    options={PageTemplateTypeGroups.map(c => {
                        return {
                            icon: c.icon,
                            text: c.text,
                            value: c.text
                        }
                    })}></SelectBox>
            </div>
            <div className="flex-fixed gap-h-10 gap-w-10">
                <Input prefix={<span className="size-24 flex-center text-1"><Icon size={14} icon={SearchSvg}></Icon></span>} theme="focus" placeholder={lst('搜索模板')} clear value={this.templateList.word} onEnter={e => {
                    this.templateList.word = e;
                    this.forceUpdate();
                }} onClear={() => {
                    this.templateList.word = '';
                    this.forceUpdate();
                }} onChange={e => {
                    this.templateList.word = e;
                    this.forceUpdate();
                }}
                ></Input>
            </div>

            <div className="flex-auto overflow-y " >
                {!this.templateList.word && this.getTags().map((tg, i) => {
                    var ts = this.templateList.list.findAll(g => g.tags.includes(tg));
                    if (ts.length == 0) return <div key={i}></div>
                    return <div className="gap-b-10 gap-t-10" key={i}>
                        <div onClick={e => {
                            this.tagSpread.set(tg, this.tagSpread.get(tg) == false ? true : false);
                            // tg.spread = tg.spread ? false : true;
                            this.forceUpdate();
                        }} className="f-12 flex  cursor gap-w-5 padding-w-5 item-hover-light">
                            <span className={"ts size-20 flex-center flex-fixed " + (this.tagSpread.get(tg) !== false ? "" : "angle-90-")}>
                                <Icon className={'text-1'} size={16} icon={ChevronDownSvg}></Icon>
                            </span>
                            <span className="flex-auto">{tg}</span>
                        </div>
                        {this.tagSpread.get(tg) !== false && <div>
                            {ts.map((tl, j) => {
                                return <div onMouseDown={e => {
                                    this.onSetTemplate(tl);
                                }} className={"h-30 gap-h-3 flex round cursor item-hover-light gap-w-5 padding-w-5 " + (this.currentPageTemplate === tl ? " item-hover-focus" : "")} key={tl.id}>
                                    <span className="flex-center size-24 rounc cursor flex-fixed"><Icon size={18} icon={tl.icon || PageSvg}></Icon></span>
                                    <span className="gap-l-5 text-overflow flex-auto">{tl.text}</span>
                                </div>
                            })}
                        </div>}
                    </div>
                })}
                {this.templateList.word && this.getSearchList().map((tl, i) => {
                    return <div onMouseDown={e => {
                        this.onSetTemplate(tl);
                    }} className={"h-30 gap-h-3 flex round cursor item-hover-light gap-w-5 padding-w-5 " + (this.currentPageTemplate === tl ? " item-hover-focus" : "")} key={tl.id}>
                        <span className="flex-center size-24 rounc cursor flex-fixed"><Icon size={18} icon={tl.icon || PageSvg}></Icon></span>
                        <span className="gap-l-5 text-overflow flex-auto">{tl.text}</span>
                    </div>
                })}
            </div>
            <div className="border-top padding-10">
                <div className="flex gap-h-3">
                    <span className="f-14"><S>更多模板</S></span>
                    <a target={'_blank'} href={window.shyConfig?.isUS ? "https://template.shy.red/" : "https://template.shy.live/"} className="gap-l-3 size-14 round flex-center flex-fixed item-hover"><Icon size={14} icon={{ name: 'byte', code: 'arrow-right-up' }}></Icon></a>
                </div>
                <div className="remark f-12"><S>发现更多诗云用户创建的模板</S></div>
            </div>
        </div>
    }
    // typeGroups = PageTemplateTypeGroups;
    templateList: SearchListType<PageTemplateType, { mime: string, tags: string[], type: string }> = { type: '', mime: 'page', loading: false, tags: [], total: 0, list: [], page: 1, size: 20 }
    getSearchList() {
        return this.templateList.list.filter(c => {
            return c.text?.indexOf(this.templateList.word) > -1 || c.description && c.description.indexOf(this.templateList.word) > -1
        })
    }
    tagSpread: Map<string, boolean> = new Map();
    getTags() {
        return lodash.uniq(this.templateList.list.map(c => c.tags).flat())
    }
    async onSearch() {
        try {
            this.templateList.loading = true;
            this.forceUpdate();
            var rs = await channel.get('/search/workspace/template', {
                page: this.templateList.page,
                classify: this.templateList.type,
                size: this.templateList.size
            });
            if (rs) {
                if (window.shyConfig.isDev)
                    rs.data = {
                        "list": [
                            {
                                "text": "网盘",
                                "url": "https://api-s2.shy.live/file?id=8d952b655f2f4961a3b34b96ef0d2aca",
                                "description": null,
                                "type": "page",
                                "sourceWorkspaceId": "4JXQ8D3y-3",
                                "file": {
                                    "ext": "",
                                    "id": "8d952b655f2f4961a3b34b96ef0d2aca",
                                    "filePath": "D:\\files\\store\\service2\\2023_11_13_0\\8d952b655f2f4961a3b34b96ef0d2aca",
                                    "relativeFilePath": "\\service2\\2023_11_13_0\\8d952b655f2f4961a3b34b96ef0d2aca",
                                    "size": 5453,
                                    "md5": "1419D5D6BADB849BD4A1B8D21B3839A3",
                                    "url": "https://api-s2.shy.live/file?id=8d952b655f2f4961a3b34b96ef0d2aca",
                                    "mime": "unknow",
                                    "filename": "file",
                                    "creater": "4EFGvb8P-2",
                                    "source": "download",
                                    "downloadUrl": "https://api-w1.shy.live/ws/file?id=d1471725c1574fbcb7d835dfb1e715e1",
                                    "isRobotGenerated": false,
                                    "createDate<d>": 1699807473077
                                },
                                "icon": {
                                    "name": "bytedance-icon",
                                    "code": "file-cabinet",
                                    "color": "rgb(217,115,13)"
                                },
                                "classify": [
                                    "个人"
                                ],
                                "tags": [
                                    "个人工作"
                                ],
                                "sourcePageId": "kTrzarZ5PrFcA2LfMVXEpy",
                                "sourceElementUrl": "/PageItem/kTrzarZ5PrFcA2LfMVXEpy",
                                "creater": "4EFGvb8P-2",
                                "userid": "4EFGvb8P-2",
                                "approve": false,
                                "id": "30b3f97a79d24b7e9adfd6ddb87696a6",
                                "useCount": 8,
                                "previewCover": null,
                                "isSysAutoCreateWorkspaceTemplate": false,
                                "createDate<d>": 1699807439734
                            },
                        ],
                        "total": 12,
                        "page": 1,
                        "size": 20
                    }
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
        return <div className="flex-auto relative">
            <iframe ref={e => this.iframe = e} className="w100 h100 no-border"></iframe>
            {this.currentPageTemplate && <div
                className="pos border padding-w-10 padding-h-5  round-16"
                style={{
                    bottom: 20, right: 20,
                    width: 'auto',
                    display: 'inline-block',
                    backgroundColor: 'rgb(251,251,250)'
                }}
            >
                {/* <div className="flex-auto">
                    <div className="bold f-16">{this.currentPageTemplate.text}</div>
                    <div className="gap-h-10"><Avatar showName size={28} userid={this.currentPageTemplate.userid}></Avatar></div>
                    <div className="remark " style={{
                        maxWidth: 600
                    }}>{this.currentPageTemplate.description}</div>
                </div> */}
                {/* <div className="flex-fixed"> */}
                <Button onClick={e => this.onSelect(this.currentPageTemplate)}><S>使用模板</S></Button>
                {/* </div> */}
            </div>}
        </div>
    }
    render() {
        var w = window.innerWidth;
        var classList: string[] = ['vh90', 'vw90', 'user-none'];
        return <div className={classList.join(" ")}>
            <div className="flex flex-full h100">
                {this.renderSide()}
                {this.renderContent()}
            </div>
        </div>
    }
    open() {

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

