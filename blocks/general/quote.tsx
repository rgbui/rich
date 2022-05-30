import { BlockView } from "../../src/block/view";
import React from 'react';
import { url, view } from "../../src/block/factory/observable";
import { ChildsArea, TextArea, TextLineChilds } from "../../src/block/view/appear";
import { TextSpan } from "../../src/block/element/textspan";
import { BlockDisplay } from "../../src/block/enum";
import { TextTurns } from "../../src/block/turn/text";
import { Block } from "../../src/block";
@url('/quote')
export class Quote extends TextSpan {
    display = BlockDisplay.block;
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get allBlockKeys(): string[] {
        return ['childs', 'subChilds'];
    }
    get childKey() {
        return 'subChilds';
    }
    /**
 * 表示当前元素如何接收该元素至sub,
 * @param this 
 * @param sub  子元素是要移动的
 */
    async acceptSubFromMove(sub: Block) {
        await this.append(sub, 0, 'subChilds');
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
}
@view('/quote')
export class QuoteView extends BlockView<Quote>{
    render() {
        return <div className='sy-block-quote' style={this.block.visibleStyle} >
            <div className='sy-block-quote-bar'></div>
            <div className='sy-block-quote-content'>
                <div>
                    {this.block.childs.length > 0 && <TextLineChilds childs={this.block.childs} rf={e => this.block.childsEl = e}></TextLineChilds>}
                    {this.block.childs.length == 0 && <TextArea block={this.block} prop='content' placeholder={'键入文字或"/"选择'}></TextArea>}
                </div>
                <div>
                    <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
                </div>
            </div>
        </div>
    }
}