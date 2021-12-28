import React from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
@url('/tab')
export class Tab extends Block {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    tabIndex: number = 0;
}
@view('/tab')
export class TabView extends BlockView<Tab>{
    render() {
        return <div className='sy-block-tab'
            style={this.block.visibleStyle}>
            <div className="sy-block-tab-items">
                <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
            </div>
            <div className="sy-block-tab-pages">
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>
        </div>
    }
}