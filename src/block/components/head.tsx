import { BaseComponent } from "../base/component";
import { url, view } from "../factory/observable";
import { TextSpan } from "./textspan";
import React from 'react';
import { ChildsArea, TextArea } from "../base/appear";
@url('/head')
export class Head extends TextSpan {
    level: 'h1' | 'h2' | 'h3' = 'h1';
}
@view("/head")
export class HeadView extends BaseComponent<Head>{
    render() {
        var style: Record<string, any> = { ...this.block.visibleStyle, fontWeight: 600 };
        if (this.block.level == 'h1') {
            style.fontSize = 30
            style.lineHeight = '39px';
        }
        else if (this.block.level == 'h2') {
            style.fontSize = 24;
            style.lineHeight = '31.2px';
        }
        else if (this.block.level == 'h3') {
            style.fontSize = 20;
            style.lineHeight = '26px';
        }
        if (this.block.childs.length > 0)
            return <div className='sy-block-text-head' style={style}
                ref={e => this.block.childsEl = e}><ChildsArea childs={this.block.childs}></ChildsArea></div>
        else
            return <div className='sy-block-text-head' style={style}>

                <TextArea placeholder={'大标题'} html={this.block.htmlContent}></TextArea>
            </div>
    }
}