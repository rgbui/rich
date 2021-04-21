import { BaseComponent } from "../base/component";
import { url, view } from "../factory/observable";
import { TextSpan } from "./textspan";
import React from 'react';
import { ChildsArea, TextArea } from "../base/appear";
@url('/head')
export class Head extends TextSpan {
    level: 'h1' | 'h2' | 'h3'
}
@view("/head")
export class HeadView extends BaseComponent<Head>{
    render() {
        var style: Record<string, any> = { ...this.block.visibleStyle, fontWeight: 'bold' };
        if (this.block.level == 'h1') {
            style.fontSize = 48
        }
        else if (this.block.level == 'h2') {
            style.fontSize = 24;
        }
        else if (this.block.level == 'h3') {
            style.fontSize = 18
        }
        if (this.block.childs.length > 0)
            return <span className='sy-block-text-span' style={style}
                ref={e => this.block.childsEl = e}><ChildsArea childs={this.block.childs}></ChildsArea></span>
        else
            return <span className='sy-block-text-span' style={style}>
                <TextArea placeholder={'大标题'} html={this.block.htmlContent}></TextArea>
            </span>
    }
}