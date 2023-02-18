import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React from 'react';
import { TextSpanArea } from "../../src/block/view/appear";
import { BlockDisplay } from "../../src/block/enum";
import { Block } from "../../src/block";
import { TextTurns } from "../../src/block/turn/text";
import { Rect } from "../../src/common/vector/point";
@url('/head')
export class Head extends Block {
    @prop()
    align: 'left' | 'center' = 'left';
    @prop()
    level: 'h1' | 'h2' | 'h3' | 'h4' = 'h1';
    get isDisabledInputLine() {
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
    async getPlain(this: Block) {
        if (this.childs.length > 0)
            return await this.getChildsPlain();
        else return this.content;
    }
    getVisibleContentBound() {
        if (this.el)
            return Rect.fromEle(this.el.querySelector('.relative') as HTMLElement);
    }
    async getHtml() {
        var tag = this.level;
        if (this.childs.length > 0) return `<${tag}>${this.getChildsHtml()}</${tag}>`
        else return `<${tag}>${this.content}</${tag}>`
    }
}
@view("/head")
export class HeadView extends BlockView<Head>{
    render() {
        var style: Record<string, any> = { fontWeight: 600 };
        if (this.props.block.align == 'center') style.textAlign = 'center';
        Object.assign(style, this.block.contentStyle);
        var pt: string = '';
        var ns: string[] = [];
        var tag: JSX.Element;
        if (this.block.level == 'h1') {
            style.fontSize = 30
            style.lineHeight = '39px';
            style.marginTop = 32;
            style.marginBottom = '4px';
            pt = '一级标题';
            ns = [undefined]
            tag = <h1 style={style} className="relative">
                <div className="sy-block-text-head-tips">{ns.map((n, i) => <em key={i}></em>)}</div>
                <TextSpanArea placeholder={pt} block={this.block}></TextSpanArea>
            </h1>;
        }
        else if (this.block.level == 'h2') {
            style.fontSize = 24;
            style.lineHeight = '31.2px';
            style.marginTop = 22;
            style.marginBottom = '1px';
            pt = '二级标题';
            ns = [undefined, undefined]
            tag = <h2 style={style} className="relative">
                <div className="sy-block-text-head-tips">{ns.map((n, i) => <em key={i}></em>)}</div>
                <TextSpanArea placeholder={pt} block={this.block}></TextSpanArea>
            </h2>;
        }
        else if (this.block.level == 'h3') {
            style.fontSize = 20;
            style.lineHeight = '26px';
            style.marginTop = '1em';
            style.marginBottom = '1px';
            pt = '三级标题';
            ns = [undefined, undefined, undefined]
            tag = <h3 style={style} className="relative">
                <div className="sy-block-text-head-tips">{ns.map((n, i) => <em key={i}></em>)}</div>
                <TextSpanArea placeholder={pt} block={this.block}></TextSpanArea>
            </h3>;
        }
        else if (this.block.level == 'h4') {
            style.fontSize = 16;
            style.lineHeight = '26px';
            style.marginTop = '1em';
            style.marginBottom = '1px';
            pt = '四级标题';
            ns = [undefined, undefined, undefined, undefined]
            tag = <h4 style={style} className="relative">
                <div className="sy-block-text-head-tips">{ns.map((n, i) => <em key={i}></em>)}</div>
                <TextSpanArea placeholder={pt} block={this.block}></TextSpanArea>
            </h4>;
        }
        return <div className='sy-block-text-head' style={this.block.visibleStyle}>
            {tag}
        </div>
    }
}