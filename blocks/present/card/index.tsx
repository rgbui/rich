import React from "react";
import { Block } from "../../../src/block";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { GridMap } from "../../../src/page/grid";
import "./style.less";

@url('/card')
export class PageCard extends Block {
    async didMounted(): Promise<void> {
        if (this.blocks.childs.length == 0) {
            this.initPageCard();
        }
    }
    async initPageCard() {
        this.blocks.childs.push(await BlockFactory.createBlock('/head',
            this.page,
            { type: 'level', content: '标题' },
            this
        ));
        this.blocks.childs.push(await BlockFactory.createBlock('/textspan',
            this.page,
            { content: '描述' },
            this
        ));
        this.forceUpdate();
    }
    init() {
        this.gridMap = new GridMap(this)
    }
    async getMd() {
        return (await this.childs.asyncMap(async b => await b.getMd())).join('  \n')
    }
}
@view('/card')
export class PageCardView extends BlockView<PageCard>{
    render() {
        return <div style={this.block.visibleStyle}><div className='sy-block-card' >
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div></div>
    }
}