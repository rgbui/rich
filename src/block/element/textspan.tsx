
import React from 'react';
import { url, view } from '../factory/observable';
import { TextArea } from '../partial/appear';
import { BlockDisplay, BlockAppear } from '../enum';
import { BlockView } from '../view';
import { Content } from './content';

@url("/textspan")
export class TextSpan extends Content {
    display = BlockDisplay.block;
    appear = BlockAppear.none;
    get isText() {
        if (this.childs.length > 0) return false;
        return true;
    }
    get isSolid() {
        return this.childs.length > 0 ? true : false;
    }
    get isLayout() {
        if (this.childs.length > 0) return true;
        else return false;
    }
}
@view("/textspan")
export class TextSpanView extends BlockView<TextSpan>{
    render() {
        if (this.block.childs.length > 0)
            return <span className='sy-block-text-span sy-appear-text-line' style={this.block.visibleStyle} ref={e => this.block.childsEl = e}>{this.block.childs.map(x =>
                <x.viewComponent key={x.id} block={x}></x.viewComponent>
            )}</span>
        else
            return <span className='sy-block-text-span sy-appear-text-line' style={this.block.visibleStyle}>
                <TextArea html={this.block.htmlContent} placeholder={'键入文字或"/"选择'}></TextArea>
            </span>
    }
}