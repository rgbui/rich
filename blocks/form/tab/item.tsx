import React from "react";
import { Tab } from ".";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";

@url('/tab/item')
export class TabItem extends Block {
    partName: string = 'tab-item';
    get myTab() {
        return this.parent as Tab
    }
    get visibleStyle() {
        var style = super.visibleStyle;
        if (this.at != this.myTab.tabIndex) {

        }
        return style;
    }
}
@view('/tab/item')
export class TabItemView extends BlockView<TabItem>{
    render() {
        return <div className='sy-block-tab-item'
            style={this.block.visibleStyle}>
            <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
        </div>
    }
}