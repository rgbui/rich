import React from "react"
import { Block } from "../../../src/block"
import { url, view } from "../../../src/block/factory/observable"
import { BlockView } from "../../../src/block/view"
import { GridMap } from "../../../src/page/grid"
import { BlockUrlConstant } from "../../../src/block/constant"
import { ChildsArea } from "../../../src/block/view/appear"
import { ActionDirective } from "../../../src/history/declare"
import { Point } from "../../../src/common/vector/point"

@url('/template')
export class TemplatePanel extends Block {
    async didMounted(): Promise<void> {

    }

    init() {
        this.gridMap = new GridMap(this)
    }
    async getMd() {
        return (await this.childs.asyncMap(async b => await b.getMd())).join('  \n')
    }

    getVisibleHandleCursorPoint(): Point {
        return null;
    }
    get isShowHandleBlock() {
        return false
    }

}

@view('/template')
export class TemplatePanelView extends BlockView<TemplatePanel>{

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
        else {
            this.block.page.kit.anchorCursor.onFocusBlockAnchor(this.block.childs.last(), { render: true });
        }
    }
    renderView() {
        return <div
            style={{
                ...this.block.visibleStyle,
                minHeight: 30,
                paddingLeft: 30,
                paddingRight: 30
            }}
            onMouseDown={e => this.mousedown(e)}
        ><ChildsArea childs={this.block.blocks.childs}></ChildsArea>
        </div>
    }
}