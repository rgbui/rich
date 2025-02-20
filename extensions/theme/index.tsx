import React, { CSSProperties } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Page } from "../../src/page";
import { S } from "../../i18n/view";
import { PopoverPosition } from "../../component/popover/position";
import { Popover, PopoverSingleton } from "../../component/popover/popover";
import { Icon } from "../../component/view/icon";
import { CardBrushSvg, CheckSvg, CloseSvg, PlatteSvg } from "../../component/svgs";
import { PageFillStyle } from "./card/bg";
import { lst } from "../../i18n/store";
import { PageLayoutType, PageThemeStyle } from "../../src/page/declare";
import { GetPageThemes } from "./themes";
import { Tip } from "../../component/view/tooltip/tip";
import { SelectBox } from "../../component/view/select/box";
import { Divider } from "../../component/view/grid";
import lodash from "lodash";
import { BlockUrlConstant } from "../../src/block/constant";
import { CardBox } from "../../src/block/element/cardbox/cardbox";
import { BlockRenderRange } from "../../src/block/enum";
import { HelpText } from "../../component/view/text";

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
    async setPageTheme(pageTheme: PageThemeStyle, group?: 'layout' | 'style') {
        if (group == 'layout') {
            await this.updateTheme({ 'pageTheme.coverStyle.display': pageTheme.coverStyle.display })
            if (pageTheme.coverStyle.display == 'none') {
                var pd = this.page.getPageDataInfo();
                if (pd?.cover?.abled) await this.page.onAddCover()
            }
            else {
                await this.page.onAddCover(false)
            }
        }
        else if (group == 'style') {
            var pt = lodash.cloneDeep(pageTheme);
            delete pt.coverStyle;
            if (this.page.pageTheme?.coverStyle) pt.coverStyle = { ...this.page.pageTheme.coverStyle };
            await this.updateTheme({ pageTheme: pt })
        }
    }
    async updateTheme(data: Record<string, any>) {
        await this.page.onUpdateProps(data, true);
        this.forceUpdate();
    }
    renderCover() {
        var hasCover = true;
        if (this.page?.pageLayout.type == PageLayoutType.textChannel || this.page?.pageLayout?.type == PageLayoutType.ppt) hasCover = false;
        var textp = 'var(--text-p-color)';
        var solid = '2px solid var(--text-p-color)';
        if (hasCover) return <div><div className="padding-w-15 remark gap-t-10 gap-b-5 f-12"><S>封面</S></div>
            <div className="flex r-gap-r-10 r-cursor padding-w-15">
                <Tip text={lst('无')}>
                    <div onMouseDown={e => {
                        this.setPageTheme({ coverStyle: { display: 'none' } }, 'layout')
                    }} className={"round  padding-5 " + ((this.page.pageTheme?.coverStyle?.display || 'none') == "none" ? "item-hover-focus" : " item-hover")}>
                        <div className="round" style={{ width: 30, height: 20, border: (this.page.pageTheme?.coverStyle?.display || 'none') == "none" ? solid : '2px solid #cac5c4' }}>
                        </div>
                    </div>
                </Tip>
                <Tip text={lst('封面')}>
                    <div onMouseDown={e => {
                        this.setPageTheme({ coverStyle: { display: 'outside' } }, 'layout')
                    }} className={"round padding-5 " + ((this.page.pageTheme?.coverStyle?.display == 'outside' ? "item-hover-focus" : " item-hover"))}>
                        <div className="round" style={{ width: 30, height: 20, border: this.page.pageTheme?.coverStyle?.display == 'outside' ? solid : '2px solid #cac5c4' }}>
                            <div style={{ width: 30, height: 10, backgroundColor: this.page.pageTheme?.coverStyle?.display == 'outside' ? textp : '#cac5c4' }}></div>
                        </div>
                    </div>
                </Tip>
                <Tip text={lst('横幅')}>
                    <div onMouseDown={e => {
                        this.setPageTheme({ coverStyle: { display: 'inside' } }, 'layout')
                    }} className={"round padding-5 " + (this.page.pageTheme?.coverStyle?.display == 'inside' ? "item-hover-focus" : " item-hover")}>
                        <div className="round" style={{ width: 30, height: 20, border: this.page.pageTheme?.coverStyle?.display == 'inside' ? solid : '2px solid #cac5c4' }}>
                            <div style={{ width: 20, marginLeft: 5, height: 10, backgroundColor: this.page.pageTheme?.coverStyle?.display == 'inside' ? textp : '#cac5c4' }}></div>
                        </div>
                    </div>
                </Tip>
                <Tip text={lst('内横幅')}>
                    <div onMouseDown={e => {
                        this.setPageTheme({ coverStyle: { display: 'inside-cover' } }, 'layout')
                    }} className={"round padding-5 " + (this.page.pageTheme?.coverStyle?.display == 'inside-cover' ? "item-hover-focus" : " item-hover")}>
                        <div className="round" style={{ width: 30, height: 20, border: this.page.pageTheme?.coverStyle?.display == 'inside-cover' ? solid : '2px solid #cac5c4' }}>
                            <div style={{ width: 20, marginLeft: 5, marginTop: 5, height: 10, backgroundColor: this.page.pageTheme?.coverStyle?.display == 'inside-cover' ? textp : '#cac5c4' }}></div>
                        </div>
                    </div>
                </Tip>
            </div>
        </div>
        else return <></>
    }
    renderCustom() {
        return <div >
            {this.renderCover()}
            <div className="remark padding-w-15  gap-t-10 gap-b-5 f-12">
                <S>透明性</S>
            </div>
            <div className="padding-w-15">
                <SelectBox border dropAlign="full" value={this.page.pageTheme.contentStyle.transparency} options={[
                    { text: lst('白色'), value: 'solid' },
                    { text: lst('玻璃'), value: 'frosted' },
                    { text: lst('渐近'), value: 'faded' },
                    // { text: lst('透明'), value: 'noborder' },
                ]} onChange={e => {
                    this.setTheme('pageTheme.contentStyle.transparency', e)
                }}></SelectBox>
            </div>

            <Divider className={'gap-h-10'}></Divider>

            <div className="remark padding-w-15  gap-b-5 f-12"><S>页面背景</S></div>
            <div className="gap-b-50"><PageFillStyle
                isFill
                openSpread={e => {
                    if (e == true) this.el.classList.remove('overflow-y')
                    else this.el.classList.add('overflow-y')
                    if (this.popover) this.popover.stopMousedownClose(e);
                }}
                onChange={e => this.setTheme('pageTheme.bgStyle', e)}
                bgStyle={this.page.pageTheme.bgStyle}></PageFillStyle>
            </div>
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
                    contentStyle.boxShadow = 'rgba(18,18,18,0.1) 0px 1px 3px 0px';
                    contentStyle.padding = 10;
                    contentStyle.height = 90;
                    contentStyle.boxSizing = 'border-box';
                    contentStyle.border = '1px solid rgb(238,238,238)';
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
                self.setPageTheme(s, name as any);
            }} className="item-hover-light cursor padding-w-10 padding-t-10 round" key={i} style={{ width: 140 }}>
                <div style={pageContentStyle} className="h-130 round-16 bg-white border-box shadow border">{renderContent()}</div>
                <div className="flex-center h-30 f-12">{(name == 'layout' && self.page.pageTheme.coverStyle.display == s.name || name == 'style' && self.page.pageTheme?.name == s.name) && <span className="flex-center size-20"><Icon size={18} icon={CheckSvg}></Icon></span>}<span>{g.text}</span></div>
            </div>
        }
        return <div className="padding-b-100">
            {this.renderCover()}
            <div className="padding-w-15">
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
        </div>
    }
    popover: Popover<PageTheme>;
    el: HTMLElement;
    render() {
        var isRenderBg = this.page?.pageLayout?.type == PageLayoutType.textChannel;
        var isBoard = this.page?.pageLayout?.type == PageLayoutType.board;
        var isPPT = this.page?.pageLayout?.type == PageLayoutType.ppt
        return <div ref={e => this.el = e} className="padding-h-15 bg-white round w-310 h100 overflow-y" style={{ width: 360 }}>
            <div className="flex flex-top padding-w-15">
                <span className="flex-auto flex h1">
                    <span className="flex">
                        <S>主题</S>
                        <HelpText className={'gap-l-3'} url={window.shyConfig?.isUS ? "https://help.shy.red/page/77#bYzFNTFKxzBQZjitZCczVb" : "https://help.shy.live/page/2008#i8PWYYn5wPbf5UGzoJ58fp"}><S>了解页面主题</S></HelpText>
                    </span>
                </span>
                <span onClick={e => this.emit('close')} className="size-30 flex-center flex-fixed text-1 item-hover cursor round">
                    <Icon size={16} icon={CloseSvg}></Icon>
                </span>
            </div>
            {isBoard && this.renderBoardBg()}
            {!isBoard && <>
                {isRenderBg && this.renderbg()}
                {!isRenderBg && !isPPT && this.renderDocBg()}
                {!isRenderBg && isPPT && this.renderPPTBg()}
            </>}
        </div>
    }
    renderBoardBg() {
        return <div>
            <div className="remark padding-w-15  gap-t-10 gap-b-5 f-12">
                <S>透明性</S>
            </div>
            <div className="padding-w-15">
                <SelectBox border dropAlign="full" value={this.page.pageTheme.contentStyle.transparency} options={[
                    { text: lst('默认'), value: 'solid' },
                    { text: lst('玻璃'), value: 'frosted' },
                    { text: lst('渐近'), value: 'faded' },
                    { text: lst('透明'), value: 'noborder' },
                ]} onChange={e => {
                    this.setTheme('pageTheme.contentStyle.transparency', e)
                }}></SelectBox>
            </div>
            {this.page.pageTheme.contentStyle.transparency != 'solid' && <><div
                className="remark padding-w-15 gap-t-10 gap-b-5 f-12">
                <S>页面背景</S>
            </div>
                <div><PageFillStyle isFill openSpread={e => {
                    if (e == true) this.el.classList.remove('overflow-y')
                    else this.el.classList.add('overflow-y')
                    if (this.popover) this.popover.stopMousedownClose(e);
                }} onChange={e => this.setTheme('pageTheme.bgStyle', e)}
                    bgStyle={this.page.pageTheme.bgStyle}></PageFillStyle>
                </div>
            </>}
        </div>
    }
    renderbg() {
        return <div className="gap-b-50">

            {this.page?.pageLayout?.type == PageLayoutType.textChannel && <div className="padding-w-15">
                <div className="remark   gap-t-10 gap-b-5 f-12">
                    <S>透明性</S>
                </div>
                <div className="gap-h-10">
                    <SelectBox
                        border
                        dropAlign="full"
                        value={this.page.pageTheme.contentStyle?.transparency}
                        options={[
                            { text: lst('白色'), value: 'solid' },
                            { text: lst('毛玻璃'), value: 'frosted' },
                            { text: lst('渐近'), value: 'faded' },
                        ]} onChange={async e => {
                            await this.setTheme('pageTheme.contentStyle.transparency', e)
                        }}></SelectBox>
                </div>
            </div>}
            <PageFillStyle isFill onChange={async e => {
                var pt = lodash.cloneDeep(this.page.pageTheme);
                pt.bgStyle = e;
                await this.updateTheme({ pageTheme: pt })
            }} bgStyle={this.page.pageTheme.bgStyle}>
            </PageFillStyle>
        </div>
    }
    renderDocBg() {
        return <>
            <div className="flex gap-b-10  padding-w-15">
                <a onClick={e => {
                    this.tab = 'sys';
                    this.forceUpdate()
                }} className={"cursor gap-r-10 flex-auto padding-w-10 flex-center h-30 round-8 " + (this.tab == 'sys' ? " bg-primary bg-p-hover text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={PlatteSvg}></Icon></span><span><S>标准主题</S></span></a>
                <a onClick={e => {
                    this.tab = 'custom';
                    this.forceUpdate()
                }} className={"cursor gap-l-10 flex-auto  padding-w-10 flex-center h-30 round-8 " + (this.tab == 'custom' ? " bg-primary bg-p-hover text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={CardBrushSvg}></Icon></span><span><S>自定义主题</S></span></a>
            </div>
            <div>
                {this.tab == 'custom' && this.page && this.renderCustom()}
                {this.tab == 'sys' && this.page && this.renderSys()}
            </div>
        </>
    }
    renderPPTBg() {
        return <>
            <div className="flex gap-b-10  padding-w-15">
                <a onClick={e => {
                    this.tab = 'sys';
                    this.forceUpdate()
                }} className={"cursor gap-r-10 flex-auto padding-w-10 flex-center h-30 round-8 " + (this.tab == 'sys' ? " bg-primary bg-p-hover text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={PlatteSvg}></Icon></span><span><S>背景</S></span></a>
                <a onClick={e => {
                    this.tab = 'custom';
                    this.forceUpdate()
                }} className={"cursor gap-l-10 flex-auto  padding-w-10 flex-center h-30 round-8 " + (this.tab == 'custom' ? " bg-primary bg-p-hover text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={CardBrushSvg}></Icon></span><span><S>卡片</S></span></a>
            </div>
            <div>
                {this.tab == 'sys' && this.page && this.renderbg()}
                {this.tab == 'custom' && this.page && this.renderPPTStyle()}
            </div>
        </>
    }
    renderPPTStyle() {
        var pageThemes = GetPageThemes(this.page);
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
                self.setPPTCardStyle(s, name as any);
            }}
                className="item-hover cursor padding-w-10 padding-t-10 round" key={i} style={{ width: 140 }}>
                <div style={pageContentStyle} className="h-130 round-16 bg-white border-box shadow border">{renderContent()}</div>
                <div className="flex-center h-30 f-12">{(name == 'layout' && self.page.pageTheme.coverStyle.display == s.name || name == 'style' && self.page.pageTheme?.name == s.name) && <span className="flex-center size-20"><Icon size={18} icon={CheckSvg}></Icon></span>}<span>{g.text}</span></div>
            </div>
        }
        return <div className="padding-b-100">
            <div className="padding-w-15">
                {pageThemes.map((pt, index) => {
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
        </div>
    }
    async setPPTCardStyle(s: PageThemeStyle, name: string) {
        await this.page.onAction('setPPTCardStyle', async () => {
            var cs = this.page.findAll(c => c.url == BlockUrlConstant.CardBox);
            for (let i = 0; i < cs.length; i++) {
                var c = cs[i] as CardBox;
                var pt = lodash.cloneDeep(c.cardThemeStyle);
                pt.contentStyle = lodash.cloneDeep(s.contentStyle);
                await c.updateProps({
                    cardThemeStyle: pt
                }, BlockRenderRange.self);
            }
        })
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