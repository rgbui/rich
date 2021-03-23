import { Block } from "../../base";

import React from 'react';
import { TextSpan } from "../textspan";

import { Icon } from "../../../component/icon";
import { prop, url, view } from "../../factory/observable";
import "./style.less";
import { BaseComponent } from "../../base/component";
import { BlockAppear } from "../../base/enum";
export enum ListType {
    circle,
    number,
    arrow
}
@url('/list')
export class List extends TextSpan {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    @prop()
    listType: ListType = ListType.circle;
    @prop()
    expand: boolean = true;
    // get selectorNextBlock()
    // {
    //     if (this.expand == true && this.blocks.subChilds && this.blocks.subChilds.length > 0) {
    //         var sub = this.blocks.subChilds.first();
    //         if (!sub.isLayout) return sub;
    //         else return sub.findContentBefore();
    //     }
    //     else return super.selectorNextBlock;
    // }
}
@view('/list')
export class ListView extends BaseComponent<List>{
    renderTextSpan() {
        if (this.block.childs.length > 0) return <span className='sy-block-list-textspan' >{this.block.childs.map(x => <x.viewComponent block={x} key={x.id}></x.viewComponent>)}</span>
        else return <span dangerouslySetInnerHTML={this.block.htmlContent} ref={e => this.block.setPart('default', e, BlockAppear.text)}></span>
    }
    renderListType() {
        if (this.block.listType == ListType.circle)
            return <span className='sy-block-list-type'>.</span>
        else if (this.block.listType == ListType.arrow) {
            if (this.block.expand == true)
                return <span className='sy-block-list-type'><Icon icon='angle-down:font'></Icon></span>
            else return <span className='sy-block-list-type'><Icon icon='angle-right:font'></Icon></span>
        }
        else if (this.block.listType == ListType.number) {
            var pas = this.block.parentBlocks;
            var at = pas.findIndex(g => g === this.block);
            var num = 0;
            for (let i = at; i >= 0; i--) {
                var prevBlock = pas[i];
                if (prevBlock instanceof List && prevBlock.listType == this.block.listType) {
                    num += 1;
                }
                else break;
            }
            return <span className='sy-block-list-type'>{num}.</span>
        }
    }
    render() {
        return <div className='sy-block-list'>
            <div className='sy-block-list-line'>
                {this.renderListType()}
                {this.renderTextSpan()}
            </div>
            {this.block.blocks.subChilds.length > 0 && <div className='sy-block-list-subs'>{this.block.blocks.subChilds.map(x => <x.viewComponent block={x} key={x.id}></x.viewComponent>)}</div>}
        </div>
    }
}