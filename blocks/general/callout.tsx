import { BlockView } from "../../src/block/view";
import React from 'react';
import { url, view } from "../../src/block/factory/observable";
import { ChildsArea, TextArea, TextLineChilds } from "../../src/block/view/appear";
import { TextSpan } from "../../src/block/element/textspan";
import { BlockDisplay } from "../../src/block/enum";
import { TextTurns } from "../../src/block/turn/text";
import { Block } from "../../src/block";

@url('/callout')
export class Callout extends TextSpan {
    display = BlockDisplay.block;
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get allBlockKeys(): string[] {
        return ['childs', 'subChilds'];
    }
    get childKey() {
        return 'subChilds';
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
    get isBackspaceAutomaticallyTurnText() {
        return true;
    }
    /**
  * 表示当前元素如何接收该元素至sub,
  * @param this 
  * @param sub  子元素是要移动的
  */
    async acceptSubFromMove(sub: Block) {
        await this.append(sub, 0, 'subChilds');
    }
    async getPlain(this: Block) {
        if (this.childs.length > 0)
            return await this.getChildsPlain();
        else return this.content + await this.getChildsPlain();
    }
}
@view('/callout')
export class CalloutView extends BlockView<Callout>{
    render() {
        return <div className='sy-block-callout'>
            <span className='sy-block-callout-icon'>💡</span>
            <div className='sy-block-callout-content'>
                <div>{this.block.childs.length > 0 &&
                    <TextLineChilds style={this.block.visibleStyle} rf={e => this.block.childsEl = e} childs={this.block.childs}></TextLineChilds>
                }{this.block.childs.length == 0 && <span className='sy-appear-text-line' style={this.block.visibleStyle}><TextArea block={this.block} prop='content' placeholder={'键入文字或"/"选择'}></TextArea></span>}</div>
                <div>
                    <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
                </div>
            </div>
        </div>
    }
}