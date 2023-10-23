import React, { CSSProperties } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Block } from "../../src/block";
import { Popover, PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { Icon } from "../../component/view/icon";
import { CardBrushSvg, CheckSvg, PlatteSvg } from "../../component/svgs";
import { S } from "../../i18n/view";
import { PageThemeStyle } from "../../src/page/declare";
import { SelectBox } from "../../component/view/select/box";
import { lst } from "../../i18n/store";
import { PageFillStyle } from "./bg";
import { getCardThemes } from "./themes";
import { Rect } from "../../src/common/vector/point";
import { InputNumber } from "../../component/view/input/number";
import { Input } from "../../component/view/input";
import lodash from "lodash";
import { BlockRenderRange } from "../../src/block/enum";
import { Tip } from "../../component/view/tooltip/tip";

export class CardTheme extends EventsComponent {
    popover: Popover<CardTheme>;
    block: Block;
    tab: 'sys' | 'custom' = 'sys';
    el: HTMLElement;
    pageTheme: PageThemeStyle;
    async setTheme(key: string, value: any) {
        lodash.set(this.pageTheme, key, value)
        await this.setPageTheme(this.pageTheme);
    }
    async setPageTheme(pageTheme: PageThemeStyle, group?: string) {
        await this.updateTheme({ 'cardStyle': pageTheme });
    }
    async updateTheme(data: Record<string, any>, cb?: () => void) {
        await this.block.onUpdateProps(data, { range: BlockRenderRange.self });
        this.open(this.block);
    }
    renderCustom() {
        return <div className="padding-w-10">
            <div className="remark gap-t-10 gap-b-5 f-12"><S>封面</S></div>
            <div className="flex r-gap-r-10 r-round-2">

                <Tip text='无布局'><div className="cursor" onMouseDown={e => this.setTheme('coverStyle.display', 'none')} style={{ border: (this.pageTheme?.coverStyle?.display || 'none') == 'none' ? "2px solid #553bff" : '2px solid #cac5c4', width: 30, height: 20 }}></div></Tip>
                <Tip text='背景布局' ><div className="cursor" onMouseDown={e => this.setTheme('coverStyle.display', 'inside')} style={{ border: this.pageTheme?.coverStyle?.display == 'inside' ? "2px solid #553bff" : '2px solid #cac5c4', width: 30, height: 20, background: this.pageTheme?.coverStyle?.display == 'inside' ? "#553bff" : '#cac5c4' }}></div></Tip>
                <Tip text='Top布局' ><div className="cursor" onMouseDown={e => this.setTheme('coverStyle.display', 'inside-cover')} style={{ border: this.pageTheme?.coverStyle?.display == 'inside-cover' ? "2px solid #553bff" : '2px solid #cac5c4', width: 30, height: 20 }}><div style={{ background: this.pageTheme?.coverStyle?.display == 'inside-cover' ? "#553bff" : '#cac5c4', height: 6 }}></div></div></Tip>
                <Tip text='Left布局'><div className="cursor flex" onMouseDown={e => this.setTheme('coverStyle.display', 'inside-cover-left')} style={{ border: this.pageTheme?.coverStyle?.display == 'inside-cover-left' ? "2px solid #553bff" : '2px solid #cac5c4', width: 30, height: 20 }} ><div style={{ background: this.pageTheme?.coverStyle?.display == 'inside-cover-left' ? "#553bff" : '#cac5c4', width: 10, height: 20 }}></div></div></Tip>
                <Tip text='Right布局' ><div className="cursor flex-end" onMouseDown={e => this.setTheme('coverStyle.display', 'inside-cover-right')} style={{ border: this.pageTheme?.coverStyle?.display == 'inside-cover-right' ? "2px solid #553bff" : '2px solid #cac5c4', width: 30, height: 20 }} ><div style={{ background: this.pageTheme?.coverStyle?.display == 'inside-cover-right' ? "#553bff" : '#cac5c4', width: 10, height: 20 }}></div></div></Tip>

            </div>
            <div className="remark  gap-t-10 gap-b-5 f-12"><S>背景</S></div>
            <div>
                <PageFillStyle openSpread={e => {
                    if (e == true) { this.el.classList.remove('overflow-y'); this.el.classList.remove('h-300') }
                    else { this.el.classList.add('overflow-y'); this.el.classList.add('h-300') }
                    if (this.popover) this.popover.stopMousedownClose(e);
                }} onChange={e => this.setTheme('coverStyle.bgStyle', e)} bgStyle={this.pageTheme.coverStyle.bgStyle}></PageFillStyle>
            </div>
            {this.pageTheme?.coverStyle.display == 'inside' && <><div className="remark   gap-t-10 gap-b-5 f-12">
                <S>透明性</S>
            </div>
                <div className="flex flex-wrap text-1">
                    <SelectBox
                        border
                        value={this.pageTheme?.contentStyle?.transparency || 'noborder'}
                        onChange={e => {
                            this.setTheme('contentStyle.transparency', e)
                        }}
                        options={[
                            { text: lst('纯色'), value: 'solid' },
                            { text: lst('透明'), value: 'noborder' },
                            { text: lst('渐变'), value: 'faded' },
                            { text: lst('毛玻璃'), value: 'frosted' }
                        ]}></SelectBox>
                </div></>}
            <div className="remark   gap-t-10 gap-b-5 f-12">
                <S>圆角</S>
            </div>
            <div className="flex flex-wrap text-1">
                <InputNumber value={this.pageTheme.contentStyle.round} onChange={e => {
                    this.setTheme('contentStyle.round', e)
                }}></InputNumber>
            </div>
            <div className="remark   gap-t-10 gap-b-5 f-12">
                <S>边框</S>
            </div>
            <div className="flex flex-wrap text-1">
                <Input value={this.pageTheme.contentStyle.border} onChange={e => {
                    this.setTheme('contentStyle.border', e)
                }}></Input>
            </div>
            <div className="remark   gap-t-10 gap-b-5 f-12">
                <S>阴影</S>
            </div>
            <div className="flex flex-wrap text-1">
                <Input value={this.pageTheme.contentStyle.shadow} onChange={e => {
                    this.setTheme('contentStyle.shadow', e)
                }}></Input>
            </div>
        </div>
    }
    renderSys() {
        var pageThems = getCardThemes();
        var self = this;
        function renderItem(g, i, name: string) {
            var s = g.pageTheme as PageThemeStyle;
            function renderContent() {
                var contentStyle: CSSProperties = {
                    borderRadius: s?.contentStyle?.round,
                    boxShadow: s?.contentStyle?.shadow,
                }
                contentStyle.borderRadius = 16;
                contentStyle.boxShadow = 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px';
                contentStyle.boxSizing = 'border-box';
                contentStyle.border = '1px solid rgb(238, 238, 238)';
                var cs = s.contentStyle;
                if (cs.border) {
                    if (typeof cs.border == 'string') contentStyle.border = cs.border;
                    else Object.assign(contentStyle, cs.border);
                }
                if (cs.round) {
                    if (typeof cs?.round == 'string' || typeof cs?.round == 'number') contentStyle.borderRadius = cs.round;
                    else Object.assign(contentStyle, cs.round);
                }
                if (cs.shadow) {
                    if (typeof cs.shadow == 'string') contentStyle.boxShadow = cs.shadow;
                    else Object.assign(contentStyle, cs.shadow);
                }
                if (s.contentStyle?.transparency !== 'noborder') {
                    if (s.contentStyle.transparency == 'solid') {
                        contentStyle.backgroundColor = '#fff'
                    }
                    else contentStyle.backgroundColor = 'rgba(255,255,255, 0.75)'
                    if (s.contentStyle.transparency == 'frosted') {
                        contentStyle.backdropFilter = 'blur(20px) saturate(170%)'
                    }
                }
                var bgStyle: CSSProperties = {}
                if (s.coverStyle.display != 'none' && s.coverStyle?.bgStyle) {
                    var bs = s?.coverStyle?.bgStyle;
                    if (s.coverStyle?.bgStyle.mode == 'color') bgStyle.backgroundColor = bs.color;
                    else if (s.coverStyle?.bgStyle.mode == 'image' || s.coverStyle?.bgStyle.mode == 'uploadImage') {
                        bgStyle.backgroundImage = `url(${bs.src})`;
                        bgStyle.backgroundSize = 'cover';
                        bgStyle.backgroundRepeat = 'no-repeat';
                        bgStyle.backgroundPosition = 'center center';
                        bgStyle.backgroundAttachment = 'fixed';
                    }
                    else if (s.coverStyle?.bgStyle.mode == 'grad') {
                        bgStyle.backgroundImage = bs?.grad?.bg;
                        bgStyle.backgroundSize = 'cover';
                        bgStyle.backgroundRepeat = 'no-repeat';
                        bgStyle.backgroundPosition = 'center center';
                        bgStyle.backgroundAttachment = 'fixed';
                    }
                }
                var round = contentStyle.borderRadius
                if (s.coverStyle?.display == 'none') {
                    return <div >
                        <div className="flex-center flex-col h-90" style={contentStyle}>
                            <div className="f-20"><S>标题</S></div>
                            <div className="h-60 f-14"><S>正文或链接</S></div>
                        </div>
                    </div>
                }
                else if (s.coverStyle.display == 'inside') {
                    return <div className="relative">
                        <div className="flex-center flex-col  h-90" style={{ ...contentStyle, ...bgStyle }}>
                            <div className="f-20"><S>标题</S></div>
                            <div className="h-60 f-14"><S>正文或链接</S></div>
                        </div>
                    </div>
                }
                else if (s.coverStyle.display == 'inside-cover') {
                    bgStyle.borderRadius = `${round}px ${round}px  0px 0px`
                    return <div className="h-90" style={contentStyle} >
                        <div className="h-30" style={bgStyle}>
                        </div>
                        <div className="flex-center flex-col h-60">
                            <div className="f-20"><S>标题</S></div>
                            <div className="h-60 f-14"><S>正文或链接</S></div>
                        </div>
                    </div>
                }
                else if (s.coverStyle.display == 'inside-cover-bottom') {
                    bgStyle.borderRadius = `  0px 0px ${round}px ${round}px`
                    return <div className="h-90" style={contentStyle} >
                        <div className="flex-center flex-col h-60">
                            <div className="f-20"><S>标题</S></div>
                            <div className="h-60 f-14"><S>正文或链接</S></div>
                        </div>
                        <div className="h-30" style={bgStyle}>
                        </div>
                    </div>
                }
                else if (s.coverStyle.display == 'inside-cover-left') {
                    bgStyle.borderRadius = `${round}px 0px 0px ${round}px `
                    contentStyle.borderRadius = `0px ${round}px ${round}px 0px`
                    return <div className="flex flex-full" style={contentStyle} >
                        <div className="h-90 flex-fixed" style={bgStyle}>
                        </div>
                        <div className="flex-auto flex-center flex-col  h-90">
                            <div className="f-20"><S>标题</S></div>
                            <div className="h-60 f-14"><S>正文或链接</S></div>
                        </div>
                    </div>
                }
                else if (s.coverStyle.display == 'inside-cover-right') {
                    bgStyle.borderRadius = `0px ${round}px ${round}px 0px`
                    contentStyle.borderRadius = `${round}px 0px 0px ${round}px `
                    return <div className="flex flex-full" style={contentStyle} >
                        <div className="flex-auto flex-center h-90">
                            <div className="f-20"><S>标题</S></div>
                            <div className="h-60 f-14"><S>正文或链接</S></div>
                        </div>
                        <div className="flex-fixed h-90" style={bgStyle}>
                        </div>
                    </div>
                }
            }
            return <div onMouseDown={e => {
                self.setPageTheme(s, name);
            }} className="item-hover cursor padding-w-5 padding-t-5 round" key={i} style={{ width: 150 }}>
                {renderContent()}
                <div className="flex-center h-30 f-12">{self.pageTheme?.name == s.name && <span className="flex-center size-20"><Icon size={18} icon={CheckSvg}></Icon></span>}<span>{g.text}</span></div>
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
    open(block: Block) {
        this.block = block;
        this.pageTheme = (this.block as any).cardStyle;
        this.forceUpdate();
    }
    render() {
        return <div
            ref={e => this.el = e}
            className="padding-h-15 bg-white round w-350 h-300 overflow-y" >
            <div className="flex gap-b-10  padding-w-10">
                <a onClick={e => {
                    this.tab = 'sys';
                    this.forceUpdate()
                }} className={"cursor gap-r-10 flex-auto padding-w-10 flex-center h-30 round-8 " + (this.tab == 'sys' ? " bg-primary text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={PlatteSvg}></Icon></span><span><S>标准样式</S></span></a>
                <a onClick={e => {
                    this.tab = 'custom';
                    this.forceUpdate()
                }} className={"cursor gap-l-10 flex-auto  padding-w-10 flex-center h-30 round-8 " + (this.tab == 'custom' ? " bg-primary text-white" : "")}><span className="flex-center size-20"><Icon size={18} icon={CardBrushSvg}></Icon></span><span><S>自定义样式</S></span></a>
            </div>
            <div>
                {this.tab == 'custom' && this.block && this.renderCustom()}
                {this.tab == 'sys' && this.block && this.renderSys()}
            </div>
        </div>
    }
}

export async function useCardTheme(block: Block, rect: Rect) {
    var pos: PopoverPosition = { roundArea: rect };
    let popover = await PopoverSingleton(CardTheme, { mask: true, });
    let fv = await popover.open(pos);
    fv.popover = popover;
    fv.open(block);
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