
import React from 'react';
import { url, view } from '../factory/observable';
import { TextArea, TextLineChilds } from '../view/appear';
import { BlockDisplay } from '../enum';
import { BlockView } from '../view';
import { Block } from '..';
@url("/textspan")
export class TextSpan extends Block {
    display = BlockDisplay.block;
    get appearElements() {
        if (this.childs.length > 0) return []
        else return this.__appearElements;
    }
}
@view("/textspan")
export class TextSpanView extends BlockView<TextSpan>{
    render() {
        if (this.block.childs.length > 0)
            return <span className='sy-block-text-span' style={this.block.visibleStyle} ref={e => this.block.childsEl = e}>
                <TextLineChilds childs={this.block.childs}></TextLineChilds>
            </span>
        else
            return <span className='sy-block-text-span' style={this.block.visibleStyle}>
                <TextArea rf={e => this.block.elementAppear({ el: e })} html={this.block.htmlContent} placeholder={'键入文字或"/"选择'}></TextArea>
            </span>
    }
}