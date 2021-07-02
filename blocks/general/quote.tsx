import { BlockView } from "../../src/block/view";
import React from 'react';
import { url, view } from "../../src/block/factory/observable";
import { TextArea } from "../../src/block/partial/appear";
import { TextSpan } from "../../src/block/element/textspan";
@url('/quote')
export class Quote extends TextSpan {

}
@view('/quote')
export class QuoteView extends BlockView<Quote>{
    render() {
        return <div className='sy-block-quote'>
            {this.block.childs.length > 0 && <span className='sy-appear-text-line' style={this.block.visibleStyle} ref={e => this.block.childsEl = e}>{this.block.childs.map(x =>
                <x.viewComponent key={x.id} block={x}></x.viewComponent>
            )}</span>}
            {this.block.childs.length == 0 && <span className='sy-appear-text-line' style={this.block.visibleStyle}>
                <TextArea html={this.block.htmlContent} placeholder={'键入文字或"/"选择'}></TextArea>
            </span>}
        </div>
    }
}