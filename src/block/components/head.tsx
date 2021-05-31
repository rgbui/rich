import { BaseComponent } from "../base/component";
import { prop, url, view } from "../factory/observable";
import { TextSpan } from "./textspan";
import React from 'react';
import { ChildsArea, TextArea } from "../base/appear";
@url('/head')
export class Head extends TextSpan {
    @prop()
    level: 'h1' | 'h2' | 'h3' = 'h1';

}
@view("/head")
export class HeadView extends BaseComponent<Head>{
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
            return <div className='sy-block-text-head sy-appear-text-line' style={style}
                ref={e => this.block.childsEl = e}><ChildsArea childs={this.block.childs}></ChildsArea></div>
        else
            return <div className='sy-block-text-head sy-appear-text-line' style={style}>
                <TextArea placeholder={'大标题'} html={this.block.htmlContent}></TextArea>
            </div>
    }
}