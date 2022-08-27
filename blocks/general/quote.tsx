import { BlockView } from "../../src/block/view";
import React from 'react';
import { url, view } from "../../src/block/factory/observable";
import { ChildsArea, TextArea, TextLineChilds } from "../../src/block/view/appear";
import { TextSpan } from "../../src/block/element/textspan";
import { BlockDisplay } from "../../src/block/enum";
import { TextTurns } from "../../src/block/turn/text";
import { Block } from "../../src/block";
import { BlockChildKey } from "../../src/block/constant";

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
        return TextTurns.urls
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
}
@view('/quote')
export class QuoteView extends BlockView<Quote>{
    render() {
        return <div style={this.block.visibleStyle}><div className='sy-block-quote'
            style={{ ...this.block.contentStyle }}
        >
            <div className='sy-block-quote-bar'></div>
            <div className='sy-block-quote-content'>
                <div data-block-content>
                    {this.block.childs.length > 0 && <TextLineChilds childs={this.block.childs} rf={e => this.block.childsEl = e}></TextLineChilds>}
                    {this.block.childs.length == 0 && <TextArea block={this.block} prop='content' placeholder={'引用'}></TextArea>}
                </div>
                <div>
                    <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
                </div>
            </div>
        </div></div>
    }
}