import React from "react";
import { PlusSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { Block } from "../../../src/block";
import { BlockUrlConstant } from "../../../src/block/constant";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { ActionDirective } from "../../../src/history/declare";
import "./style.less";

@url('/tab')
export class Tab extends Block {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    tabIndex: number = 0;
    get allBlockKeys(): string[] {
        return ['childs', 'subChilds']
    }
    @prop()
    showIcon: boolean = false;
    async didMounted(): Promise<void> {
        if (this.childs.length == 0) {
            await this.createInitTabItems();
            this.forceUpdate()
        }
    }
    async createInitTabItems() {
        this.blocks.childs = [];
        this.blocks.subChilds = [];
        this.blocks.childs.push(await BlockFactory.createBlock('/tab/item', this.page, { content: 'Tab1' }, this));
        this.blocks.subChilds.push(await BlockFactory.createBlock('/tab/page', this.page, { blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: 'Content of Tab Pane 1' }] } }, this));

        this.blocks.childs.push(await BlockFactory.createBlock('/tab/item', this.page, { content: 'Tab2' }, this));
        this.blocks.subChilds.push(await BlockFactory.createBlock('/tab/page', this.page, { blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: 'Content of Tab Pane 2' }] } }, this));

        this.blocks.childs.push(await BlockFactory.createBlock('/tab/item', this.page, { content: 'Tab3' }, this));
        this.blocks.subChilds.push(await BlockFactory.createBlock('/tab/page', this.page, { blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: 'Content of Tab Pane 3' }] } }, this));

    }
    async onAddTabItem() {
        this.onAction(ActionDirective.onAddTabItem, async () => {
            await this.appendBlock({ url: '/tab/item', content: '标签' }, this.blocks.childs.length, 'childs');
            await this.appendBlock({ url: '/tab/page', blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: '标签内容' }] } }, this.blocks.subChilds.length, 'subChilds');
        })
    }
    changeTabIndex(tabeIndex) {
        this.tabIndex = tabeIndex;
        this.forceUpdate()
    }
}
@view('/tab')
export class TabView extends BlockView<Tab>{
    render() {
        return <div className='sy-block-tab'
            style={this.block.visibleStyle}>
            <div className="sy-block-tab-items">
                <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
                <div className="sy-block-tab-plus" onMouseDown={e => this.block.onAddTabItem()}><Icon size={14} icon={PlusSvg}></Icon></div>
            </div>
            <div className="sy-block-tab-pages">
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>
        </div>
    }
}


