import { BlockView } from "../../src/block/view";
import React from 'react';
import { url, view } from "../../src/block/factory/observable";
import { TextArea } from "../../src/block/partial/appear";
import { TextSpan } from "../../src/block/element/textspan";
@url('/callout')
export class Callout extends TextSpan {

}
@view('/callout')
export class CalloutView extends BlockView<Callout>{
    render() {
        return <div className='sy-block-callout'>
            <span className='sy-block-callout-icon'>💡</span>
            <div className='sy-block-callout-content'>
                {this.block.childs.length > 0 && <span className='sy-appear-text-line' style={this.block.visibleStyle} ref={e => this.block.childsEl = e}>{this.block.childs.map(x =>
                    <x.viewComponent key={x.id} block={x}></x.viewComponent>
                )}</span>}
                {this.block.childs.length == 0 && <span className='sy-appear-text-line' style={this.block.visibleStyle}>
                    <TextArea html={this.block.htmlContent} placeholder={'键入文字或"/"选择'}></TextArea>
                </span>
                }</div>
        </div>
    }
}