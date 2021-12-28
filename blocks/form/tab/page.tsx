import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import React from "react";
import { ChildsArea } from "../../../src/block/view/appear";
import { Tab } from ".";
@url('/tab/page')
export class TabPage extends Block {
    partName: string = 'tab-page';
    get myTab() {
        return this.parent as Tab
    }
    get visibleStyle() {
        var style = super.visibleStyle;
        if (this.at != this.myTab.tabIndex) {
            style.display = 'none';
        }
        return style;
    }
}
@view('/tab/page')
export class TabPageView extends BlockView<TabPage>{
    render() {
        return <div className='sy-block-tag-page'
            style={this.block.visibleStyle}>
            <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
        </div>
    }
}