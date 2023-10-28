import React, { CSSProperties } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Page } from "../../src/page";
import { S } from "../../i18n/view";
import { PopoverPosition } from "../popover/position";
import { Popover, PopoverSingleton } from "../popover/popover";
import { Icon } from "../../component/view/icon";
import { CardBrushSvg, CheckSvg, CloseSvg, PlatteSvg } from "../../component/svgs";
import { SelectBox } from "../../component/view/select/box";
import { Divider } from "../../component/view/grid";
import { PageFillStyle } from "./bg";
import { lst } from "../../i18n/store";
import lodash from "lodash";
import { PageLayoutType, PageThemeStyle } from "../../src/page/declare";
import { GetPageThemes } from "./themes";

export class PageTheme extends EventsComponent {
    page: Page;
    oldPageTheme: PageThemeStyle;
    open(page: Page) {
        this.page = page;
        this.oldPageTheme = lodash.cloneDeep(page.pageTheme);
        this.forceUpdate();
    }
    tab: 'sys' | 'custom' = 'sys';
    async setTheme(key: string, value: any) {
        await this.updateTheme({ [key]: value })
    }
    async setPageTheme(pageTheme: PageThemeStyle, group: string) {
        if (group == 'layout') {
            await this.updateTheme({ 'pageTheme.coverStyle.display': pageTheme.coverStyle.display })
            if (pageTheme.coverStyle.display == 'none') {
                var pd = this.page.getPageDataInfo();
                if (pd?.cover?.abled)
                    this.page.onAddCover()
            }
            else{
                this.page.onAddCover(false)
            }
        }
        else if (group == 'style') {
            var pt = lodash.cloneDeep(pageTheme);
            delete pt.coverStyle;
            if (this.page.pageTheme?.coverStyle) pt.coverStyle = { ...this.page.pageTheme.coverStyle };
            await this.updateTheme({ pageTheme: pt })
        }
    }
    async updateTheme(data: Record<string, any>, cb?: () => void) {
        await this.page.onUpdateProps(data, true, cb);
        this.forceUpdate();
    }
    renderCustom() {
        var hasCover = true;
        if (this.page?.pageLayout.type == PageLayoutType.textChannel || this.page?.pageLayout?.type == PageLayoutType.docCard) hasCover = false;
        return <div className="padding-w-10">
            {hasCover && <><div className="remark gap-t-10 gap-b-5 f-12"><S>封面</S></div>
                <div><SelectBox
                    border
                    value={this.page.pageTheme?.coverStyle?.display || 'none'}
                    onChange={e => {
                        this.setTheme('pageTheme.coverStyle.display', e)
                    }}
                    options={[
                        { text: lst('无'), value: 'none' },
                        { text: lst('封面'), value: 'outside' },
                        { text: lst('横幅'), value: 'inside' },
                        { text: lst('内封面'), value: 'inside-cover' }
                    ]}>
                </SelectBox>
                </div>
                <Divider></Divider></>}

            <div className="remark  gap-t-10 gap-b-5 f-12"><S>页面背景</S></div>
            <div>
                <PageFillStyle openSpread={e => {
                    if (e == true) this.el.classList.remove('overflow-y')
                    else this.el.classList.add('overflow-y')
                    if (this.popover) this.popover.stopMousedownClose(e);
                }} onChange={e => this.setTheme('pageTheme.bgStyle', e)} bgStyle={this.page.pageTheme.bgStyle}></PageFillStyle>
            </div>
            <Divider></Divider>
            <div className="remark   gap-t-10 gap-b-5 f-12">
                <S>透明性</S>
            </div>
            <div className="flex flex-wrap text-1">
                <div className="flex-auto gap-r-15 " onClick={e => this.setTheme('pageTheme.contentStyle.transparency', 'solid')}>
                    <div className={"cursor h-80  box-border padding-w-10  border round-8" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.page.pageTheme.contentStyle.transparency == 'solid' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>无透明</S></span></div>
                </div>
                <div className="flex-auto gap-r-15" onClick={e => this.setTheme('pageTheme.contentStyle.transparency', 'frosted')}>
                    <div className={"cursor h-80  box-border padding-w-10  border round-8" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.page.pageTheme.contentStyle.transparency == 'frosted' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>毛玻璃</S></span></div>
                </div>
                <div className="flex-auto gap-r-15 " onClick={e => this.setTheme('pageTheme.contentStyle.transparency', 'faded')}>
                    <div className={"cursor h-80  box-border padding-w-10  border round-8" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.page.pageTheme.contentStyle.transparency == 'faded' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>渐近</S></span></div>
                </div>
                <div className="flex-auto gap-r-15" onClick={e => this.setTheme('pageTheme.contentStyle.transparency', 'noborder')}>
                    <div className={"cursor h-80  box-border padding-w-10  border round-8" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-white" : " bg-black")} style={{ width: (300 - 45) / 2 }}>
                        <div className={"h-10 w-30 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-100 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                        <div className={"h-10 w-80 round gap-h-10" + (this.page.pageTheme.contentStyle.color == 'light' ? " bg-black" : " bg-white")}></div>
                    </div>
                    <div className="flex gap-h-10">{this.page.pageTheme.contentStyle.transparency == 'noborder' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>无边框</S></span></div>
                </div>
            </div>
            {/* <Divider></Divider>
            <div className="remark   gap-t-10 gap-b-5 f-12">
                <S>主题色</S>
            </div>
            <div className="flex flex-wrap text-1">
                <div className="flex-auto gap-r-15 " onClick={e => this.setTheme('pageTheme.contentStyle.color', 'light')}>
                    <div className="h-80  box-border padding-w-10  border round-8 " style={{ width: (300 - 45) / 2 }}>
                        <div className="bg-black h-10 w-30 round gap-h-10"></div>
                        <div className="bg-black h-10 w-100 round gap-h-10"></div>
                        <div className="bg-black h-10 w-80 round gap-h-10"></div>
                    </div>
                    <div className="flex gap-h-10">{this.page.pageTheme.contentStyle.color == 'light' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>明亮</S></span></div>
                </div>
                <div className="flex-auto gap-r-15" onClick={e => this.setTheme('pageTheme.contentStyle.color', 'dark')}>
                    <div className="h-80 box-border padding-w-10  border round-8 bg-black" style={{ width: (300 - 45) / 2 }}>
                        <div className="bg-white h-10 w-30 round gap-h-10"></div>
                        <div className="bg-white h-10 w-100 round gap-h-10"></div>
                        <div className="bg-white h-10 w-80 round gap-h-10"></div>
                    </div>
                    <div className="flex gap-h-10">{this.page.pageTheme.contentStyle.color == 'dark' && <span className="size-20"><Icon size={16} icon={CheckSvg}></Icon></span>}<span><S>暗黑</S></span></div>
                </div>
            </div> */}
        </div>
    }
    renderSys() {
        var pageThems = GetPageThemes(this.page);
        var self = this;
        function renderItem(g, i, name: string) {
            var s = g.pageTheme as PageThemeStyle;
            function renderContent() {
                var contentStyle: CSSProperties = {
                    borderRadius: s?.contentStyle?.round,
                    boxShadow: s?.contentStyle?.shadow,
                }
                var cs = s.contentStyle;
                if (cs.border) {
                    if (typeof cs.border == 'string') contentStyle.border = cs.border;
                    else Object.assign(contentStyle, cs.border);
                }
                if (cs.round) {
                    if (typeof cs?.round == 'string') contentStyle.borderRadius = cs.round;
                    else Object.assign(contentStyle, cs.round);
                }
                if (cs.shadow) {
                    if (typeof cs.shadow == 'string') contentStyle.boxShadow = cs.shadow;
                    else Object.assign(contentStyle, cs.shadow);
                }
                if (s.contentStyle?.transparency !== 'noborder') {
                    contentStyle.borderRadius = 16;
                    contentStyle.boxShadow = 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px';
                    contentStyle.padding = 10;
                    contentStyle.height = 90;
                    contentStyle.boxSizing = 'border-box';
                    contentStyle.border = '1px solid rgb(238, 238, 238)';
                    if (s.coverStyle?.display == 'inside-cover')
                        contentStyle.paddingTop = 0;
                    contentStyle.marginTop = 10;
                    contentStyle.marginBottom = 10;
                    if (s.contentStyle.transparency == 'solid') {
                        contentStyle.backgroundColor = '#fff'
                    }
                    else contentStyle.backgroundColor = 'rgba(255,255,255, 0.75)'
                    if (s.contentStyle.transparency == 'frosted') {
                        contentStyle.backdropFilter = 'blur(20px) saturate(170%)'
                    }
                }
                if (s.coverStyle?.display == 'outside') {
                    contentStyle.height = 70;
                    return <div>
                        <img style={{ borderRadius: '16px 16px 0px 0px' }} className="w100 h-30 obj-center" src={s?.coverStyle?.thumb || 'https://resources.shy.live/gallery/shy_6_thumb.jpg'} />
                        <div className="gap-w-15 " style={contentStyle}>
                            <div className="f-20"><S>标题</S></div>
                            <div className="h-60 f-14"><S>正文或链接</S></div>
                        </div>
                    </div>
                }
                else if (s.coverStyle?.display == 'inside') {
                    return <div >
                        <div className="gap-w-15">
                            <img className="w100 h-30 obj-center" src={s?.coverStyle?.thumb || 'https://resources.shy.live/gallery/shy_6_thumb.jpg'} />
                            <div style={contentStyle}>
                                <div className="f-20"><S>标题</S></div>
                                <div className="h-60 f-14"><S>正文或链接</S></div>
                            </div>
                        </div>
                    </div>
                }
                else if (s.coverStyle?.display == 'inside-cover') {
                    return <div className="padding-h-10">
                        <div style={contentStyle} className="gap-w-15 h-110 round-8 bg-white border border-box shadow">
                            <img className="w100 h-30 obj-center" style={{ borderRadius: '8px 8px 0px 0px' }} src={s?.coverStyle?.thumb || 'https://resources.shy.live/gallery/shy_6_thumb.jpg'} />
                            <div className="f-20 gap-w-10"><S>标题</S></div>
                            <div className="f-14 gap-w-10"><S>正文或链接</S></div>
                        </div>
                    </div>
                }
                else if (s.coverStyle?.display == 'none') {
                    return <div className="padding-h-10">
                        <div style={contentStyle} className="gap-w-15 h-110 round-8 bg-white border border-box shadow ">
                            <div className="f-20 gap-w-10 gap-t-10"><S>标题</S></div>
                            <div className=" f-14 gap-w-10"><S>正文或链接</S></div>
                        </div>
                    </div>
                }
            }
            var pageContentStyle: CSSProperties = {}
            if (s?.bgStyle) {
                var bs = s.bgStyle;
                if (bs.mode == 'color') pageContentStyle.backgroundColor = bs.color;
                else if (bs.mode == 'image' || bs.mode == 'uploadImage') {
                    pageContentStyle.backgroundImage = `url(${bs.src})`;
                    pageContentStyle.backgroundSize = 'cover';
                    pageContentStyle.backgroundRepeat = 'no-repeat';
                    pageContentStyle.backgroundPosition = 'center center';
                    pageContentStyle.backgroundAttachment = 'fixed';
                }
                else if (bs.mode == 'grad') {
                    pageContentStyle.backgroundImage = bs?.grad?.bg;
                    pageContentStyle.backgroundSize = 'cover';
                    pageContentStyle.backgroundRepeat = 'no-repeat';
                    pageContentStyle.backgroundPosition = 'center center';
                    pageContentStyle.backgroundAttachment = 'fixed';
                }
            }
            return <div onMouseDown={e => {
                self.setPageTheme(s, name);
            }} className="item-hover cursor padding-w-5 padding-t-5 round" key={i} style={{ width: 150 }}>
                <div style={pageContentStyle} className="h-130 round-16 bg-white border-box shadow border">{renderContent()}</div>
                <div className="flex-center h-30 f-12">{(name == 'layout' && self.page.pageTheme.coverStyle.display == s.name || name == 'style' && self.page.pageTheme?.name == s.name) && <span className="flex-center size-20"><Icon size={18} icon={CheckSvg}></Icon></span>}<span>{g.text}</span></div>
            </div>
        }
        return <div className="padding-w-10 padding-b-100">
            {pageThems.map((pt, index) => {
                return <div key={index}>
                    <div className="flex remark f-12 gap-h-10">{pt.text}</div>
                    <div className="flex flex-wrap ">
                        {pt.childs.map((s, i) => {
                            return renderItem(s, i, pt.name);
                        })}
                    </div>
                </div>
            })}
        </div>
    }
    popover: Popover<PageTheme>;
    el: HTMLElement;
    render() {
        return <div ref={e => this.el = e} className="padding-h-15 bg-white round w-300 h100 overflow-y" style={{ width: 350 }}>
            <div className="h1 flex padding-w-10">
                <span className="flex-auto"><S>主题</S></span>
                <span onClick={e => this.emit('close')} className="size-30 flex-center flex-fixed text-1 item-hover cursor round">
                    <Icon size={16} icon={CloseSvg}></Icon>
                </span>
            </div>
            <div className="flex gap-b-10  padding-w-10">
                <a onClick={e => {
                    this.tab = 'sys';
                    this.forceUpdate()
                }} className={"cursor gap-r-10 flex-auto padding-w-10 flex-center h-30 round-8 " + (this.tab == 'sys' ? " bg-primary text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={PlatteSvg}></Icon></span><span><S>标准主题</S></span></a>
                <a onClick={e => {
                    this.tab = 'custom';
                    this.forceUpdate()
                }} className={"cursor gap-l-10 flex-auto  padding-w-10 flex-center h-30 round-8 " + (this.tab == 'custom' ? " bg-primary text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={CardBrushSvg}></Icon></span><span><S>自定义主题</S></span></a>

            </div>
            <div>
                {this.tab == 'custom' && this.page && this.renderCustom()}
                {this.tab == 'sys' && this.page && this.renderSys()}
            </div>
        </div>
    }
}

export async function usePageTheme(page: Page) {
    var pos: PopoverPosition = { dockRight: true };
    let popover = await PopoverSingleton(PageTheme, { mask: true, });
    let fv = await popover.open(pos);
    fv.popover = popover;
    fv.open(page);
    return new Promise((resolve: (value: any) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(true);
        });
        popover.only('close', () => {
            resolve(true);
        });
    })
}