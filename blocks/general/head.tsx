import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React from 'react';
import { TextArea, TextLineChilds } from "../../src/block/view/appear";
import { BlockDisplay } from "../../src/block/enum";
import { Block } from "../../src/block";
import { TextTurns } from "../../src/block/turn/text";
@url('/head')
export class Head extends Block {
    @prop()
    level: 'h1' | 'h2' | 'h3' | 'h4' = 'h1';
    get isAllowInputTextLine() {
        return false;
    }
    get appearAnchors() {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
    display = BlockDisplay.block;
    async onGetTurnUrls() {
        var urls = TextTurns.urls;
        //if (this.level == 'h2') urls.remove('/head?{level:"h2"}')
        //else if (this.level == 'h3') urls.remove('/head?{level:"h3"}')
        return urls;
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
}
@view("/head")
export class HeadView extends BlockView<Head>{
    render() {
        var style: Record<string, any> = { ...this.block.visibleStyle, fontWeight: 600 };
        var pt: string = '';
        var ns: string[] = [];
        if (this.block.level == 'h1') {
            style.fontSize = 30
            style.lineHeight = '39px';
            style.marginTop = 32;
            style.marginBottom = '4px';
            pt = '一级标题';
            ns = [undefined]
        }
        else if (this.block.level == 'h2') {
            style.fontSize = 24;
            style.lineHeight = '31.2px';
            style.marginTop = 22;
            style.marginBottom = '1px';
            pt = '二级标题';
            ns = [undefined, undefined]
        }
        else if (this.block.level == 'h3') {
            style.fontSize = 20;
            style.lineHeight = '26px';
            style.marginTop = '1em';
            style.marginBottom = '1px';
            pt = '三级标题';
            ns = [undefined, undefined, undefined]
        }
        else if (this.block.level == 'h4') {
            style.fontSize = 16;
            style.lineHeight = '26px';
            style.marginTop = '1em';
            style.marginBottom = '1px';
            pt = '四级标题';
            ns = [undefined, undefined, undefined, undefined]
        }
        if (this.block.childs.length > 0)
            return <div className='sy-block-text-head' style={style}>
                <div className="sy-block-text-head-tip">{ns.map((n, i) => <em key={i}></em>)}</div>
                <TextLineChilds
                    rf={e => this.block.childsEl = e}
                    childs={this.block.childs}></TextLineChilds></div>
        else
            return <div className='sy-block-text-head' style={style}>
                <div className="sy-block-text-head-tip">{ns.map((n, i) => <em key={i}></em>)}</div>
                <TextArea block={this.block} placeholder={pt} prop='content' ></TextArea>
            </div>
    }
}