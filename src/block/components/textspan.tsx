import { Content } from "../base/common/content";
import React from 'react';
import { BaseComponent } from "../base/component";
import { BlockAppear, BlockDisplay } from "../base/enum";
import { url, view } from "../factory/observable";
import { TextArea } from "../base/appear";
@url("/textspan")
export class TextSpan extends Content {
    display = BlockDisplay.block;
    appear = BlockAppear.none;
    content: string;
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
export class TextSpanView extends BaseComponent<TextSpan>{
    render() {
        if (this.block.childs.length > 0)
            return <span className='sy-block-text-span' style={this.block.visibleStyle} ref={e => this.block.childsEl = e}>{this.block.childs.map(x =>
                <x.viewComponent key={x.id} block={x}></x.viewComponent>
            )}</span>
        else
            return <span className='sy-block-text-span' style={this.block.visibleStyle}>
                <TextArea html={this.block.htmlContent}></TextArea>
            </span>
    }
}