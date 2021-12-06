import { Block } from "../../../src/block";
import React from 'react';
import { Icon } from "../../../component/view/icon";
import { prop, url, view } from "../../../src/block/factory/observable";
import "./style.less";
import { BlockView } from "../../../src/block/view";
import { BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { ChildsArea, TextArea, TextLineChilds } from "../../../src/block/view/appear";
import { TextTurns } from "../../../src/block/turn/text";
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
    display = BlockDisplay.block;
    onExpand() {
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
        if (this.isExpand == false && this.listType == ListType.arrow) keys.remove('subChilds');
        return keys;
    }
    get multiLines() {
        return false;
    }
    get isContinuouslyCreated() {
        return true;
    }
    get continuouslyProps() {
        return {
            expand: false,
            listType: this.listType
        }
    }
    get appearAnchors() {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
    async onGetTurnUrls() {
        var urls = TextTurns.urls;
        // if (this.listType == ListType.arrow) urls.remove('/list?{listType:2}')
        // else if (this.listType == ListType.number) urls.remove('/list?{listType:1}')
        // else if (this.listType == ListType.circle) urls.remove('/list?{listType:0}')
        return urls;
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    /**
   * 表示当前元素如何接收该元素至sub,
   * @param this 
   * @param sub  子元素是要移动的
   */
    async acceptSubFromMove(sub: Block) {
        await this.append(sub, 0, 'subChilds');
        if (this.expand != true && this.listType == ListType.arrow) {
            this.updateProps({ expand: true }, BlockRenderRange.self);
        }
    }
    get isBackspaceAutomaticallyTurnText() {
        return true;
    }
    get childKey() {
        return 'subChilds';
    }
    getChilds(key: string) {
        if (this.isExpand == false && this.listType == ListType.arrow) return [];
        return super.getChilds(key);
    }
}
@view('/list')
export class ListView extends BlockView<List>{
    renderListType() {
        if (this.block.listType == ListType.circle) return <span className='sy-block-list-text-type'>•</span>
        else if (this.block.listType == ListType.arrow) {
            return <span className='sy-block-list-text-type' style={{ cursor: 'pointer' }} onMouseDown={e => {
                e.stopPropagation();
                this.block.onExpand();
            }}><Icon icon={this.block.expand == true ? 'arrow-down:sy' : 'arrow-right:sy'}></Icon></span>
        }
        else if (this.block.listType == ListType.number) {
            var pas = this.block.parentBlocks;
            var at = pas.findIndex(g => g === this.block);
            var num = 1;
            for (let i = at - 1; i >= 0; i--) {
                var prevRow = pas[i];
                if (prevRow) {
                    if (prevRow instanceof List && prevRow.listType == this.block.listType) {
                        num += 1;
                    }
                    else break;
                } else break;
            }
            return <span className='sy-block-list-text-type'>{num}.</span>
        }
    }
    renderText() {
        if (this.block.childs.length > 0)
            return <TextLineChilds childs={this.block.childs}></TextLineChilds>
        else
            return <TextArea rf={e => this.block.elementAppear({ el: e })} html={this.block.htmlContent} placeholder={'键入文字或"/"选择'}></TextArea>
    }
    render() {
        return <div className='sy-block-list' style={this.block.visibleStyle} >
            <div className='sy-block-list-text'>
                {this.renderListType()}
                <div className='sy-block-list-text-content'>{this.renderText()}</div>
            </div>
            {this.block.isExpand && <div className='sy-block-list-subs'>
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>}
        </div>
    }
}