import { BlockView } from "../../src/block/view";
import React from 'react';
import { url, view } from "../../src/block/factory/observable";
import { TextArea, TextLineChilds } from "../../src/block/view/appear";
import { TextSpan } from "../../src/block/element/textspan";
import { BlockDisplay } from "../../src/block/enum";
import { TextTurns } from "../../src/block/turn/text";
@url('/callout')
export class Callout extends TextSpan {
    display = BlockDisplay.block;
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
}
@view('/callout')
export class CalloutView extends BlockView<Callout>{
    render() {
        return <div className='sy-block-callout'>
            <span className='sy-block-callout-icon'>💡</span>
            <div className='sy-block-callout-content'>
                {this.block.childs.length > 0 &&
                    <TextLineChilds style={this.block.visibleStyle} rf={e => this.block.childsEl = e} childs={this.block.childs}></TextLineChilds>
                }
                {this.block.childs.length == 0 && <span className='sy-appear-text-line' style={this.block.visibleStyle}>
                    <TextArea  block={this.block}  prop='content'  placeholder={'键入文字或"/"选择'}></TextArea>
                </span>
                }</div>
        </div>
    }
}