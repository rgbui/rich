import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React from 'react';
import { TextArea, TextLineChilds } from "../../src/block/view/appear";
import { TextSpan } from "../../src/block/element/textspan";
import { BlockDisplay } from "../../src/block/enum";
@url('/head')
export class Head extends TextSpan {
    @prop()
    level: 'h1' | 'h2' | 'h3' = 'h1';
    get multiLines() {
        return false;
    }
    get appearElements() {
        if (this.childs.length > 0) return []
        return this.__appearElements;
    }
    display = BlockDisplay.block;
}
@view("/head")
export class HeadView extends BlockView<Head>{
    render() {
        var style: Record<string, any> = { ...this.block.visibleStyle, fontWeight: 600 };
        if (this.block.level == 'h1') {
            style.fontSize = 30
            style.lineHeight = '39px';
            style.marginTop = '2em';
            style.marginBottom = '4px';
        }
        else if (this.block.level == 'h2') {
            style.fontSize = 24;
            style.lineHeight = '31.2px';
            style.marginTop = '1.4em';
            style.marginBottom = '1px';
        }
        else if (this.block.level == 'h3') {
            style.fontSize = 20;
            style.lineHeight = '26px';
            style.marginTop = '1em';
            style.marginBottom = '1px';
        }
        if (this.block.childs.length > 0)
            return <div className='sy-block-text-head'><TextLineChilds
                style={style}
                rf={e => this.block.childsEl = e}
                childs={this.block.childs}></TextLineChilds></div>
        else
            return <div className='sy-block-text-head' style={style}>
                <TextArea rf={e => this.block.elementAppear({ el: e })} placeholder={'大标题'} html={this.block.htmlContent}></TextArea>
            </div>
    }
}