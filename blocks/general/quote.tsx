import { BlockView } from "../../src/block/view";
import React, { CSSProperties } from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { ChildsArea, TextArea, TextLineChilds } from "../../src/block/view/appear";
import { TextSpan } from "../../src/block/element/textspan";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { TextTurns } from "../../src/block/turn/text";
import { Block } from "../../src/block";
import { BlockChildKey } from "../../src/block/constant";
import lodash from "lodash";
import { Point, Rect } from "../../src/common/vector/point";
import { dom } from "../../src/common/dom";
import { ls, lst } from "../../i18n/store";
import "./style.less";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { BackgroundColorList } from "../../extensions/color/data";

@url('/quote')
export class Quote extends TextSpan {
    display = BlockDisplay.block;
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get allBlockKeys() {
        return [BlockChildKey.childs, BlockChildKey.subChilds];
    }
    get appearAnchors() {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
    async onGetTurnUrls() {
        return TextTurns.blockDatas();
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    get contentEl() {
        if (this.el)
            return this.el.querySelector('[data-block-content]') as HTMLElement;
        else return this.el;
    }
    get isBackspaceAutomaticallyTurnText() {
        return true;
    }
    async getPlain(this: Block) {
        if (this.childs.length > 0)
            return await this.getChildsPlain();
        else return this.content + await this.getChildsPlain();
    }
    getVisibleContentBound() {
        return this.getVisibleBound();
    }
    async getHtml() {
        var quote = '';
        if (this.childs.length > 0) quote = `<quote>${(await this.childs.asyncMap(async c => await c.getHtml())).join('')}</quote>`
        else quote = `<quote>${this.content}</quote>`;
        if (this.subChilds.length > 0) {
            quote += await (await this.childs.asyncMap(async c => c.getHtml())).join('')
        }
        return quote;
    }
    async getMd() {
        var ps: string[] = [];
        if (this.childs.length > 0) ps.push(`> ` + (await this.childs.asyncMap(async c => { await c.getMd() })).join(""))
        else ps.push('> ' + this.content)
        if (this.subChilds.length > 0) {
            for (let s of this.subChilds) {
                ps.push('\t' + await s.getMd())
            }
        }
        return ps.join('  \n');
    }
    @prop()
    lineColor: string = null;
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var at = rs.findIndex(g => g.name == 'text-center');
        lodash.remove(rs, g => g.name == 'text-center');
        rs.splice(at, 0,
            {
                text: lst('边颜色'),
                icon: { name: 'byte', code: 'align-left' },
                name: 'lineColor',
                childs: [
                    {
                        type: MenuItemType.color,
                        name: 'lineColor',
                        block: ls.isCn ? false : true,
                        options: BackgroundColorList().map(f => {
                            return {
                                text: f.text,
                                value: f.color,
                                checked: this.lineColor == f.color ? true : false
                            }
                        })
                    },
                ]
            }
        )
        return rs;
    }
    async onClickContextMenu(this: Block, item: MenuItem<BlockDirective | string>, event: MouseEvent, options?: { merge?: boolean }) {
        if (item.name == 'lineColor') {
            await this.onUpdateProps({ lineColor: item.value },
                {
                    range: BlockRenderRange.self
                }
            );
        }
        else super.onClickContextMenu(item, event, options);
    }
    getVisibleHandleCursorPoint() {
        var pos = Point.from(this.getVisibleBound());
        var h = this.el.querySelector('.sy-block-quote-content') as HTMLElement;
        var lh = parseFloat(dom(h).style('lineHeight'));
        var bound = Rect.fromEle(h);
        pos.y = bound.y + lh / 2;
        return pos;
    }
}

@view('/quote')
export class QuoteView extends BlockView<Quote>{
    renderView() {
        var style: CSSProperties = {};
        if(this.block.smallFont)
        style.fontSize = this.block.page.cacSmallFont(this.block.smallFont)
        var barStyle: CSSProperties = { }
        if (this.block.lineColor) {
            barStyle.backgroundColor = this.block.lineColor;
        }
        return <div style={this.block.visibleStyle}><div className='sy-block-quote'
            style={{ ...this.block.contentStyle, ...style }}
        ><div className="gap-h-3 relative">
                <div className='sy-block-quote-bar' style={barStyle}></div>
                <div className='sy-block-quote-content'>
                    <div data-block-content>
                        {this.block.childs.length > 0 && <TextLineChilds childs={this.block.childs} rf={e => this.block.childsEl = e}></TextLineChilds>}
                        {this.block.childs.length == 0 && <TextArea block={this.block} prop='content' placeholder={lst('引用')}></TextArea>}
                    </div>
                    <div>
                        <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
                    </div>
                </div>
            </div>
        </div>{this.renderComment()}</div>
    }
}