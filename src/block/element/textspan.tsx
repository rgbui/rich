
import React from 'react';
import { url, view } from '../factory/observable';
import { TextArea, TextLineChilds } from '../view/appear';
import { BlockDisplay } from '../enum';
import { BlockView } from '../view';
import { Block } from '..';
import { TextTurns } from '../turn/text';
@url("/textspan")
export class TextSpan extends Block {
    display = BlockDisplay.block;
    get appearAnchors() {
        if (this.childs.length > 0) return []
        else return this.__appearAnchors;
    }
    async onGetTurnUrls() {
        return TextTurns.urls
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    get isTextEmpty() {
        if (this.childs.length == 0) {
            return this.firstElementAppear.isEmpty
        }
        else return false;
    }
}
@view("/textspan")
export class TextSpanView extends BlockView<TextSpan>{
    render() {
        if (this.block.childs.length > 0)
            return <div className='sy-block-text-span' style={this.block.visibleStyle} ref={e => this.block.childsEl = e}>
                <TextLineChilds childs={this.block.childs}></TextLineChilds>
            </div>
        else return <div className='sy-block-text-span' style={this.block.visibleStyle}>
            <TextArea rf={e => this.block.elementAppear({ el: e })} html={this.block.htmlContent} placeholder={'键入文字或"/"选择'}></TextArea>
        </div>
    }
}
