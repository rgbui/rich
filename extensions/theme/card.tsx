import React, { CSSProperties } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Block } from "../../src/block";
import { Popover, PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { Icon } from "../../component/view/icon";
import { CheckSvg } from "../../component/svgs";
import { S } from "../../i18n/view";
import { PageThemeStyle } from "../../src/page/declare";
import { SelectBox } from "../../component/view/select/box";
import { lst } from "../../i18n/store";
import { PageFillStyle } from "./card/bg";
import { getCardThemes } from "./themes";
import { Rect } from "../../src/common/vector/point";
import lodash from "lodash";
import { BlockRenderRange } from "../../src/block/enum";
import { Tip } from "../../component/view/tooltip/tip";
import { BgBorder } from "./card/bg.boder";

export class CardTheme extends EventsComponent {
    popover: Popover<CardTheme>;
    block: Block;
    tab: 'sys' | 'custom' = 'sys';
    el: HTMLElement;
    pageTheme: PageThemeStyle;
    async setTheme(key: string, value: any) {
        lodash.set(this.pageTheme, key, value)
        if (key == 'coverStyle.display') {
            if (this.pageTheme.coverStyle?.display != 'none') {
                if (!this.pageTheme?.coverStyle?.bgStyle) {
                    this.pageTheme.coverStyle.bgStyle = { mode: 'color', color: '#fff' }
                }
                if (this.pageTheme?.coverStyle?.bgStyle?.mode == 'none') {
                    this.pageTheme.coverStyle.bgStyle.mode = 'color';
                    this.pageTheme.coverStyle.bgStyle.color = '#fff';
                }
                if (this.pageTheme?.contentStyle?.transparency == 'solid') {
                    if (!this.pageTheme.contentStyle) this.pageTheme.contentStyle = { color: 'light', transparency: 'noborder' }
                    this.pageTheme.contentStyle.transparency = 'noborder';
                }
            }
        }
        this.onUpdateTheme();
    }
    async onUpdateTheme() {
        await this.block.onUpdateProps({ 'cardStyle': this.pageTheme }, { range: BlockRenderRange.self });
        this.forceUpdate();
    }
    onLazyUpdate = lodash.debounce(async (d) => {
        await this.block.onUpdateProps({ 'cardStyle': this.pageTheme }, { range: BlockRenderRange.self });
    }, 800)
    renderCustom() {
        var textp = 'var(--text-p-color)';
        var solid = '2px solid var(--text-p-color)'
        return <div className="padding-w-10">
            <div className="remark gap-b-5 f-12"><S>封面</S></div>
            <div className="flex r-gap-r-10 r-round-2">
                <Tip text='无布局'><div className="cursor" onMouseDown={e => this.setTheme('coverStyle.display', 'none')} style={{ border: (this.pageTheme?.coverStyle?.display || 'none') == 'none' ? solid : '2px solid #cac5c4', width: 30, height: 20 }}></div></Tip>
                <Tip text='背景布局' ><div className="cursor" onMouseDown={e => this.setTheme('coverStyle.display', 'inside')} style={{ border: this.pageTheme?.coverStyle?.display == 'inside' ? solid : '2px solid #cac5c4', width: 30, height: 20, background: this.pageTheme?.coverStyle?.display == 'inside' ? textp : '#cac5c4' }}></div></Tip>
                <Tip text='Top布局' ><div className="cursor" onMouseDown={e => this.setTheme('coverStyle.display', 'inside-cover')} style={{ border: this.pageTheme?.coverStyle?.display == 'inside-cover' ? solid : '2px solid #cac5c4', width: 30, height: 20 }}><div style={{ background: this.pageTheme?.coverStyle?.display == 'inside-cover' ? textp : '#cac5c4', height: 6 }}></div></div></Tip>
                <Tip text='Left布局'><div className="cursor flex" onMouseDown={e => this.setTheme('coverStyle.display', 'inside-cover-left')} style={{ border: this.pageTheme?.coverStyle?.display == 'inside-cover-left' ? solid : '2px solid #cac5c4', width: 30, height: 20 }} ><div style={{ background: this.pageTheme?.coverStyle?.display == 'inside-cover-left' ? textp : '#cac5c4', width: 10, height: 20 }}></div></div></Tip>
                <Tip text='Right布局' ><div className="cursor flex-end" onMouseDown={e => this.setTheme('coverStyle.display', 'inside-cover-right')} style={{ border: this.pageTheme?.coverStyle?.display == 'inside-cover-right' ? solid : '2px solid #cac5c4', width: 30, height: 20 }} ><div style={{ background: this.pageTheme?.coverStyle?.display == 'inside-cover-right' ? textp : '#cac5c4', width: 10, height: 20 }}></div></div></Tip>
            </div>
            {(this.pageTheme?.coverStyle?.display || 'none') != 'none' && <div>
                <div className="remark  gap-t-10 gap-b-5 f-12"><S>背景</S></div>
                <div>
                    <PageFillStyle isNotEmpty openSpread={e => {
                        if (e == true) { this.el.classList.remove('overflow-y'); this.el.classList.remove('h-300') }
                        else { this.el.classList.add('overflow-y'); this.el.classList.add('h-300') }
                        if (this.popover) this.popover.stopMousedownClose(e);
                    }} onChange={e => this.setTheme('coverStyle.bgStyle', e)} bgStyle={this.pageTheme.coverStyle.bgStyle}></PageFillStyle>
                </div>
            </div>}
            {this.pageTheme?.coverStyle.display == 'inside' && <><div className="remark   gap-t-10 gap-b-5 f-12">
                <S>透明性</S>
            </div>
                <div >
                    <SelectBox
                        border
                        dropAlign="full"
                        value={this.pageTheme?.contentStyle?.transparency || 'noborder'}
                        onChange={e => {
                            this.setTheme('contentStyle.transparency', e)
                        }}
                        options={[
                            { text: lst('纯色'), value: 'solid' },
                            { text: lst('渐变'), value: 'faded' },
                            { text: lst('玻璃'), value: 'frosted' }
                        ]}></SelectBox>
                </div>
            </>}
        </div>
    }
    renderSys() {
        var pt = getCardThemes()[0];
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
                    if (typeof cs.border == 'string') {
                        if (contentStyle.border.includes(';')) {
                            var ccs = contentStyle.border.split(';');
                            contentStyle.borderTop = ccs[0];
                            contentStyle.borderRight = ccs[1];
                            contentStyle.borderBottom = ccs[2];
                            contentStyle.borderLeft = ccs[3];
                        }
                        else contentStyle.border = cs.border;
                    }
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
                return <div >
                    <div className="flex-center flex-col h-90" style={contentStyle}>
                        <div className="f-20"><S>标题</S></div>
                        <div className="h-60 f-14"><S>正文或链接</S></div>
                    </div>
                </div>
            }
            return <div onMouseDown={e => {
                self.pageTheme.name = s.name;
                Object.assign(self.pageTheme.contentStyle, lodash.cloneDeep(s.contentStyle))
                self.onUpdateTheme();
            }} className="item-hover cursor padding-w-5 padding-t-5 round" key={i} style={{ width: 150 }}>
                {renderContent()}
                <div className="flex-center h-30 f-12">{self.pageTheme?.name == s.name && <span className="flex-center size-20"><Icon size={18} icon={CheckSvg}></Icon></span>}<span>{g.text}</span></div>
            </div>
        }
        return <div className="padding-w-10 padding-b-100">
            <div >
                {this.mode == 'style' && <div className="flex remark f-12 gap-h-10">
                    <span className="flex-fixed" onMouseDown={e => {
                        if (this.mode == 'style') return;
                        this.mode = 'style';
                        this.forceUpdate();
                    }}>{pt.text}</span>
                    <span className="link cursor flex-auto flex-end" onMouseDown={e => {
                        if (this.mode == 'custom') return;
                        this.mode = 'custom';
                        this.forceUpdate()
                    }}><S>自定义风格</S></span>
                </div>}
                {this.mode == 'custom' && <div className="flex remark f-12 gap-h-10">
                    <span className="flex-fixed" onMouseDown={e => {
                        if (this.mode == 'custom') return;
                        this.mode = 'custom';
                        this.forceUpdate()
                    }}><S>自定义风格</S></span>
                    <span className=" link cursor flex-auto flex-end" onMouseDown={e => {
                        if (this.mode == 'style') return;
                        this.mode = 'style';
                        this.forceUpdate();
                    }}>{pt.text}</span>
                </div>}
                {this.mode == 'custom' && <div>
                    <BgBorder contentStyle={self.pageTheme.contentStyle} onChange={e => {
                        Object.assign(self.pageTheme.contentStyle, e);
                        this.forceUpdate();
                        this.onLazyUpdate(e);
                    }} ></BgBorder>
                </div>}
                {this.mode == 'style' && <div className="flex flex-wrap ">
                    {pt.childs.map((s, i) => {
                        return renderItem(s, i, pt.name);
                    })}
                </div>}
            </div>
        </div>
    }
    mode: 'style' | 'custom' = 'style';
    open(block: Block) {
        this.block = block;
        this.mode = 'style';
        this.pageTheme = (this.block as any).cardStyle;
        this.forceUpdate();
    }
    render() {
        return <div
            ref={e => this.el = e}
            className="padding-h-10 bg-white round w-350 h-300 overflow-y" >
            <div>
                {this.block && this.renderCustom()}
                {this.block && this.renderSys()}
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