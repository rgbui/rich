
import { BlockView } from "../../../src/block/view";
import { url, view } from "../../../src/block/factory/observable";
import { TextSpan } from "../../general/textspan";
import React from 'react';
import { TextArea } from "../../../src/block/partial/appear";
@url('/list/text')
export class ListText extends TextSpan {
    partName = 'text';
}
@view('/list/text')
export class ListTextView extends BlockView<ListText>{
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