import { Block } from "../../../src/block";
import React from 'react';
import { Icon } from "../../../src/component/icon";
import { prop, url, view } from "../../../src/block/factory/observable";
import "./style.less";
import { BlockView } from "../../../src/block/view";
import { BlockAppear, BlockDisplay } from "../../../src/block/partial/enum";
import { ChildsArea, TextArea } from "../../../src/block/partial/appear";
export enum ListType {
    circle,
    number,
    arrow
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
   
}
@view('/list')
export class ListView extends BlockView<List>{
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
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
            {this.block.blocks.subChilds.length > 0 && <div className='sy-block-list-subs'>
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>}
        </div>
    }
}