import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import React from "react";
import { ChildsArea } from "../../../src/block/view/appear";
import { Tab } from ".";
import { ActionDirective } from "../../../src/history/declare";
import { BlockUrlConstant } from "../../../src/block/constant";
import { GridMap } from "../../../src/page/grid";

@url('/tab/page')
export class TabPage extends Block {
    partName: string = 'tab-page';
    init() {
        this.gridMap = new GridMap(this)
    }
    get myTab() {
        return this.parent as Tab
    }
    get visibleStyle() {
        var style = super.visibleStyle;
        if (this.at != this.myTab.tabIndex) {
            style.display = 'none';
        }
        style.paddingTop = 0;
        style.paddingBottom = 0;
        style.paddingLeft = 0;
        style.paddingRight = 0;
        style.padding = 0
        return style;
    }
    get handleBlock(): Block {
        return this.myTab
    }
    get isAllowDrop() {
        return false;
    }
    get isCanEmptyDelete() {
        return true
    }
    async getMd() {
        var tag = '';
        if (this.childs.length > 0) return tag + '' + (await (this.childs.asyncMap(async b => await b.getMd()))).join('  \n') + "  "
        else return tag + '' + this.content + "  "
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
                    this.block.page.kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                })
            });
        }
    }
    renderView()  {
        return <div className='sy-block-tab-page'
            style={this.block.visibleStyle}
            onMouseDown={e => this.mousedown(e)}
        ><ChildsArea childs={this.block.blocks.childs}></ChildsArea>
        </div>
    }
}