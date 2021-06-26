import { Block } from "../../../src/block";
import React from 'react';
import { Icon } from "../../../src/component/icon";
import { prop, url, view } from "../../../src/block/factory/observable";
import "./style.less";
import { BlockView } from "../../../src/block/view";
import { BlockAppear, BlockDisplay, BlockRenderRange } from "../../../src/block/partial/enum";
import { ChildsArea } from "../../../src/block/partial/appear";
export enum ListType {
    circle = 0,
    number = 1,
    arrow = 2
}
@url('/list')
export class List extends Block {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    @prop()
    listType: ListType = ListType.circle;
    @prop()
    expand: boolean = true;
    display = BlockDisplay.block
    appear = BlockAppear.layout;
    onExpand() {
        console.log(this.expand, 'ex');
        /**
         * 当前元素会折叠
         */
        this.onUpdateProps({ expand: !this.expand }, BlockRenderRange.self);
    }
    get isExpand() {
        return this.blocks.subChilds.length > 0 && !(this.listType == ListType.arrow && this.expand == false)
    }
    /**
     * 当子元素处于折叠状态时，
     * 其对应的subChilds就不应搜到了，不参于编辑
     */
    get blockKeys() {
        var keys = Object.keys(this.blocks);
        if (this.isExpand == false) keys.remove('subChilds');
        return keys;
    }
}
@view('/list')
export class ListView extends BlockView<List>{
    renderListType() {
        if (this.block.listType == ListType.circle) return <span className='sy-block-list-text-type'>.</span>
        else if (this.block.listType == ListType.arrow) {
            return <span className='sy-block-list-text-type' style={{ cursor: 'pointer' }} onMouseDown={e => {
                e.stopPropagation();
                this.block.onExpand();
            }}><Icon icon={this.block.expand == true ? 'arrow-down:sy' : 'arrow-right:sy'}></Icon></span>
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
            return <span className='sy-block-list-text-type'>{num}.</span>
        }
    }
    render() {
        return <div className='sy-block-list'>
            <div className='sy-block-list-text'>
                {this.renderListType()}
                <div className='sy-block-list-text-content'><ChildsArea childs={this.block.childs}></ChildsArea></div>
            </div>
            {this.block.isExpand && <div className='sy-block-list-subs'>
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>}
        </div>
    }
}