import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { ChildsArea, TextArea, TextLineChilds } from "../../src/block/view/appear";
import { TextSpan } from "../../src/block/element/textspan";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { TextTurns } from "../../src/block/turn/text";
import { Block } from "../../src/block";
import { BlockChildKey } from "../../src/block/constant";
import { Icon } from "../../component/view/icon";
import { IconArguments } from "../../extensions/icon/declare";
import { useIconPicker } from "../../extensions/icon";
import { Rect } from "../../src/common/vector/point";

@url('/callout')
export class Callout extends TextSpan {
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
        return TextTurns.urls
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    get contentEl() {
        if (this.el) return this.el.querySelector('[data-block-content]') as HTMLElement;
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
        if (this.childs.length > 0) quote = `<p>${(await this.childs.asyncMap(async c => c.getHtml())).join('')}</p>`
        else quote = `<p>${this.content}</p>`;
        if (this.subChilds.length > 0) {
            quote += await (await this.childs.asyncMap(async c => c.getHtml())).join('')
        }
        return quote;
    }
    async getMd() {
        var ps: string[] = [];
        if (this.childs.length > 0) ps.push(`` + (await this.childs.asyncMap(async c => { return await c.getMd() })).join(""))
        else ps.push('' + this.content)
        if (this.subChilds.length > 0) {
            for (let s of this.subChilds) {
                ps.push('\t' + await s.getMd())
            }
        }
        return ps.join('  \n');
    }
    async onChangeIcon(e: React.MouseEvent) {
        e.stopPropagation();
        var icon = await useIconPicker({ roundArea: Rect.fromEvent(e) }, this.calloutIcon);
        if (typeof icon != 'undefined') {
            this.onUpdateProps({ calloutIcon: icon }, { range: BlockRenderRange.self })
        }
    }
    @prop()
    calloutIcon: IconArguments = { name: "emoji", code: '💡' };
}
@view('/callout')
export class CalloutView extends BlockView<Callout>{
    render() {
        return <div style={this.block.visibleStyle}><div className='sy-block-callout flex-top' style={{ ...this.block.contentStyle, padding: 16 }}>
            <div onMouseDown={e => this.block.onChangeIcon(e)} style={{ width: this.block.page.lineHeight, height: this.block.page.lineHeight }} className='size-20 flex-center round cursor item-hover flex-fixed gap-r-5'>
                <Icon size={18} icon={this.block.calloutIcon}></Icon>
            </div>
            <div className='flex-auto'>
                <div data-block-content>{this.block.childs.length > 0 &&
                    <TextLineChilds rf={e => this.block.childsEl = e} childs={this.block.childs}></TextLineChilds>
                }{this.block.childs.length == 0 && <span className='sy-appear-text-line' style={this.block.visibleStyle}><TextArea block={this.block} prop='content' placeholder={'首重'}></TextArea></span>}</div>
                <div>
                    <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
                </div>
            </div>
        </div>
        </div>
    }
}