
import React from 'react';
import { url, view } from '../factory/observable';
import { TextArea, TextLineChilds, TextSpanArea } from '../view/appear';
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
    get isTextContentBlockEmpty() {
        if (this.childs.length == 0) {
            return this.firstElementAppear.isEmpty
        }
        else return false;
    }
    get visibleStyle(): React.CSSProperties {
        var style = super.visibleStyle;
        if (this.isFreeBlock) {
            style.minWidth = 80
        }
        return style;
    }
}
@view("/textspan")
export class TextSpanView extends BlockView<TextSpan>{
    render() {
        return <div className='sy-block-text-span' style={this.block.visibleStyle}>
            <TextSpanArea block={this.block}></TextSpanArea>
        </div>
    }
}
