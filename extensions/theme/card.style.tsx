
import lodash from "lodash";
import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Popover, PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { CardBox } from "../../src/block/element/cardbox/cardbox";
import { Tip } from "../../component/view/tooltip/tip";
import { BlockRenderRange } from "../../src/block/enum";
import { PageFillStyle } from "./card/bg";
import { SelectBox } from "../../component/view/select/box";
import { PageThemeStyle } from "../../src/page/declare";
import { Divider } from "../../component/view/grid";

export class CardBoxStyle extends EventsComponent {
    async setTheme(key: string, value: any) {
        lodash.set(this.cardThemeStyle, key, value)
        if (key == 'coverStyle.display') {
            if (this.cardThemeStyle.coverStyle?.display != 'none') {
                if (!this.cardThemeStyle.bgStyle) {
                    this.cardThemeStyle.bgStyle = { mode: 'color', color: '#fff' }
                }
                if (this.cardThemeStyle.bgStyle.mode == 'none') {
                    this.cardThemeStyle.bgStyle.mode = 'color';
                    this.cardThemeStyle.bgStyle.color = '#fff';
                }
            }
        }
        this.onUpdateTheme();
    }
    async onUpdateTheme() {
        await this.block.onUpdateProps({ 'cardThemeStyle': this.cardThemeStyle }, { range: BlockRenderRange.self });
        this.forceUpdate();
    }
    onLazyUpdate = lodash.debounce(async (d) => {
        await this.block.onUpdateProps({ 'cardThemeStyle': this.cardThemeStyle }, { range: BlockRenderRange.self });
    }, 800)
    render() {
        var textp = 'var(--text-p-color)';
        var solid = '2px solid var(--text-p-color)'
        return <div ref={e => this.el = e} className="round padding-10">
            <div className="flex  r-round-2" >
                <Tip text='无布局'><div className="cursor gap-r-10" onMouseDown={e => this.setTheme('coverStyle.display', 'none')} style={{ border: (this.cardThemeStyle?.coverStyle?.display || 'none') == 'none' ? solid : '2px solid #cac5c4', width: 30, height: 20 }}></div></Tip>
                <Tip text='背景布局' ><div className="cursor gap-r-10" onMouseDown={e => this.setTheme('coverStyle.display', 'inside')} style={{ border: this.cardThemeStyle?.coverStyle?.display == 'inside' ? solid : '2px solid #cac5c4', width: 30, height: 20, background: this.cardThemeStyle?.coverStyle?.display == 'inside' ? textp : '#cac5c4' }}></div></Tip>
                <Tip text='Top布局' ><div className="cursor gap-r-10" onMouseDown={e => this.setTheme('coverStyle.display', 'inside-cover')} style={{ border: this.cardThemeStyle?.coverStyle?.display == 'inside-cover' ? solid : '2px solid #cac5c4', width: 30, height: 20 }}><div style={{ background: this.cardThemeStyle?.coverStyle?.display == 'inside-cover' ? textp : '#cac5c4', height: 6 }}></div></div></Tip>
                <Tip text='Left布局'><div className="cursor flex  gap-r-10" onMouseDown={e => this.setTheme('coverStyle.display', 'inside-cover-left')} style={{ border: this.cardThemeStyle.coverStyle?.display == 'inside-cover-left' ? solid : '2px solid #cac5c4', width: 30, height: 20 }} ><div style={{ background: this.cardThemeStyle?.coverStyle?.display == 'inside-cover-left' ? textp : '#cac5c4', width: 10, height: 20 }}></div></div></Tip>
                <Tip text='Right布局' ><div className="cursor flex-end" onMouseDown={e => this.setTheme('coverStyle.display', 'inside-cover-right')} style={{ border: this.cardThemeStyle?.coverStyle?.display == 'inside-cover-right' ? solid : '2px solid #cac5c4', width: 30, height: 20 }} ><div style={{ background: this.cardThemeStyle?.coverStyle?.display == 'inside-cover-right' ? textp : '#cac5c4', width: 10, height: 20 }}></div></div></Tip>
            </div>
            {(this.cardThemeStyle?.coverStyle?.display || 'none') != 'none' && <div className="gap-h-10">
                <div className="remark gap-b-5 f-12"><S>强调</S></div>
                <div>
                    <PageFillStyle
                        openSpread={e => {
                            if (e == true) {
                                this.el.classList.remove('overflow-y');
                            }
                            else {
                                this.el.classList.add('overflow-y');
                            }
                            if (this.popover) this.popover.stopMousedownClose(e);
                        }}
                        onChange={e => this.setTheme('coverStyle.bgStyle', e)}
                        bgStyle={this.cardThemeStyle.coverStyle.bgStyle}
                    ></PageFillStyle>
                </div>
            </div>}
            <div className="gap-h-10">
                <div className="remark gap-b-5 f-12">
                    <S>透明性</S>
                </div>
                <div>
                    <SelectBox
                        border
                        dropAlign="full"
                        value={this.cardThemeStyle?.contentStyle?.transparency || 'noborder'}
                        onChange={e => {
                            this.setTheme('contentStyle.transparency', e)
                        }}
                        options={[
                            { text: lst('透明'), value: 'noborder' },
                            { text: lst('渐变'), value: 'faded' },
                            { text: lst('玻璃'), value: 'frosted' },
                            { text: lst('纯色'), value: 'solid' },
                        ]}></SelectBox>
                </div>
            </div>
            <Divider></Divider>
            <div className="gap-h-10">
                <div className="emark gap-b-5 f-12"><S>背景</S></div>
                <div>
                    <PageFillStyle openSpread={e => {
                        if (e == true) {
                            this.el.classList.remove('overflow-y');
                        }
                        else {
                            this.el.classList.add('overflow-y');
                        }
                        if (this.popover) this.popover.stopMousedownClose(e);
                    }}
                        onChange={e => this.setTheme('bgStyle', e)}
                        bgStyle={this.cardThemeStyle.bgStyle}
                    ></PageFillStyle>
                </div>
            </div>
        </div>
    }
    open(block: CardBox) {
        this.cardThemeStyle = lodash.cloneDeep(block.cardThemeStyle);
        if (!this.cardThemeStyle?.coverStyle?.display) {
            if (!this.cardThemeStyle.coverStyle) this.cardThemeStyle.coverStyle = {} as any;
            this.cardThemeStyle.coverStyle.display = 'none';
            this.cardThemeStyle.coverStyle.bgStyle = { mode: 'none', color: '#fff' };
        }
        this.block = block;
        this.forceUpdate();
    }
    block: CardBox;
    el: HTMLElement;
    popover: Popover<CardBoxStyle>;
    cardThemeStyle: PageThemeStyle = {
        bgStyle: {
            mode: 'none',
            color: ''
        },
        contentStyle: {
            color: 'light',
            transparency: 'frosted'
        }
    }
}

export async function useCardBoxStyle(pos: PopoverPosition, block: CardBox, change?: (cardThemeStyle: PageThemeStyle) => void) {
    let popover = await PopoverSingleton(CardBoxStyle, { mask: true, });
    let fv = await popover.open(pos);
    fv.popover = popover;
    fv.open(block);
    return new Promise((resolve: (cardThemeStyle: PageThemeStyle) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(fv.cardThemeStyle);
        });
        popover.only('close', () => {
            resolve(fv.cardThemeStyle)
        });
        fv.only('change', c => {
            if (typeof change == 'function') change(c);
        })
    })
}