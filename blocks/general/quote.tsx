import { BlockView } from "../../src/block/view";
import React from 'react';
import { url, view } from "../../src/block/factory/observable";
import { TextArea, TextLineChilds } from "../../src/block/view/appear";
import { TextSpan } from "../../src/block/element/textspan";
import { BlockDisplay } from "../../src/block/enum";
@url('/quote')
export class Quote extends TextSpan {
    display=BlockDisplay.block;
    get appearAnchors()
    {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
}
@view('/quote')
export class QuoteView extends BlockView<Quote>{
    render() {
        return <div className='sy-block-quote'>
            {this.block.childs.length > 0 && <TextLineChilds childs={this.block.childs} style={this.block.visibleStyle} rf={e => this.block.childsEl = e}></TextLineChilds>}
            {this.block.childs.length == 0 && <TextArea rf={e => this.block.elementAppear({ el: e })} style={this.block.visibleStyle} html={this.block.htmlContent} placeholder={'键入文字或"/"选择'}></TextArea>}
        </div>
    }
}