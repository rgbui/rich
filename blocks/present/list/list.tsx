import { Block } from "../../../src/block";
import React from 'react';
import { Icon } from "../../../component/view/icon";
import { prop, url, view } from "../../../src/block/factory/observable";
import "./style.less";
import { BlockView } from "../../../src/block/view";
import { BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { ChildsArea, TextArea, TextLineChilds } from "../../../src/block/view/appear";
import { TextTurns } from "../../../src/block/turn/text";
import { TriangleSvg } from "../../../component/svgs";
import { BlockChildKey } from "../../../src/block/constant";
import { DropDirection } from "../../../src/kit/handle/direction";
import { dom } from "../../../src/common/dom";

export enum ListType {
    circle = 0,
    number = 1,
    toggle = 2
}

@url('/list')
export class List extends Block {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get allBlockKeys() {
        return [BlockChildKey.childs, BlockChildKey.subChilds];
    }
    @prop()
    listType: ListType = ListType.circle;
    @prop()
    expand: boolean = true;
    display = BlockDisplay.block;
    onExpand() {
        /**
         * 当前元素会折叠
         */
        this.onUpdateProps({ expand: !this.expand }, { range: BlockRenderRange.self });
    }
    get isExpand() {
        return this.blocks.subChilds.length > 0 && !(this.listType == ListType.toggle && this.expand == false)
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
    isVisbileKey(key: BlockChildKey) {
        if (this.listType == ListType.toggle) {
            if (this.expand == false && key == BlockChildKey.subChilds) return false;
        }
        return super.isVisibleKey(key);
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
    get isBackspaceAutomaticallyTurnText() {
        return true;
    }
    get contentEl() {
        if (this.el) return this.el.querySelector('[data-block-content]') as HTMLElement;
        else return this.el;
    }
    async getPlain(this: Block) {
        if (this.childs.length > 0) return await this.getChildsPlain();
        else return this.content + await this.getChildsPlain();
    }
    dropEnter(this: Block, direction: DropDirection) {
        var el = this.contentEl;
        var dire = DropDirection[direction];
        var className = 'shy-block-drag-over-' + dire;
        if (!el.classList.contains(className))
        {
            dom(el).removeClass(g => g.startsWith('shy-block-drag-over'));
            el.classList.add(className);
        }
    }
    dropLeave(this: Block) {
        var el = this.contentEl;
        dom(el).removeClass(g => g.startsWith('shy-block-drag-over'));
    }
}
@view('/list')
export class ListView extends BlockView<List>{
    renderListType() {
        if (this.block.listType == ListType.circle) return <span className='sy-block-list-text-type'>•</span>
        else if (this.block.listType == ListType.toggle) {
            return <span className='sy-block-list-text-type text ts-transform round item-hover'
                style={{
                    cursor: 'pointer',
                    transform: this.block.expand ? 'rotateZ(180deg)' : 'rotateZ(90deg)',
                    height: this.block.page.lineHeight,
                }} onMouseDown={e => {
                    e.stopPropagation();
                    this.block.onExpand();
                }}>
                <Icon size={10} icon={TriangleSvg}></Icon>
            </span>
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
            return <TextArea block={this.block} prop='content' placeholder={'键入文字或"/"选择'}></TextArea>
    }
    render() {
        return <div className='sy-block-list'>
            <div style={this.block.visibleStyle}>
                <div className='sy-block-list-text' data-block-content style={this.block.contentStyle}> {this.renderListType()}
                    <div className='sy-block-list-text-content'>{this.renderText()}</div>
                </div>
            </div>
            {this.block.isExpand && <div className='sy-block-list-subs'>
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>}
        </div>
    }
}