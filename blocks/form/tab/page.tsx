import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import React from "react";
import { ChildsArea } from "../../../src/block/view/appear";
import { Tab } from ".";
import { ActionDirective } from "../../../src/history/declare";
import { BlockUrlConstant } from "../../../src/block/constant";

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
    get handleBlock(): Block {
        return this.myTab
    }
    get isCanDrop() {
        return false;
    }
}
@view('/tab/page')
export class TabPageView extends BlockView<TabPage>{
    async mousedown(event: React.MouseEvent) {
        if (this.block.childs.length == 0) {
            event.stopPropagation()
            await this.block.page.onAction(ActionDirective.onCreateBlockByEnter, async () => {
                var newBlock = await this.block.page.createBlock(BlockUrlConstant.TextSpan, {}, this.block);
                newBlock.mounted(() => {
                    this.block.page.kit.anchorCursor.onFocusBlockAnchor(newBlock, {render:true, merge: true });
                })
            });
        }
    }
    render() {
        return <div className='sy-block-tab-page'
            style={this.block.visibleStyle}
            onMouseDown={e => this.mousedown(e)}

        >
            <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
        </div>
    }
}