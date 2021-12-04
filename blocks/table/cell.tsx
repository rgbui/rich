import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { ChildsArea } from "../../src/block/view/appear";
import { BlockDisplay } from "../../src/block/enum";
import { Block } from "../../src/block";
import { ActionDirective } from "../../src/history/declare";
import { BlockUrlConstant } from "../../src/block/constant";
@url('/table/cell')
export class TableCell extends Block {
    @prop()
    rowspan: number = 1;
    @prop()
    colspan: number = 1;
    display = BlockDisplay.block;
    partName = 'cell';
    get isCell() {
        return true;
    }
}
@view('/table/cell')
export class TableCellView extends BlockView<TableCell>{
    async mousedown(event: React.MouseEvent) {
        if (this.block.childs.length == 0) {
            event.stopPropagation()
            await this.block.onAction(ActionDirective.onCreateBlockByEnter, async () => {
                var newBlock = await this.block.page.createBlock(BlockUrlConstant.TextSpan, {}, this.block);
                newBlock.mounted(() => {
                    this.block.page.kit.explorer.onFocusAnchor(newBlock.createAnchor());
                })
            });
        }
    }
    render() {
        var style: Record<string, any> = {

        };
        return <td style={style}
            onMouseDown={e => this.mousedown(e)}
            rowSpan={this.block.rowspan == 1 ? undefined : this.block.rowspan}
            colSpan={this.block.colspan == 1 ? undefined : this.block.colspan}
            ref={e => this.block.childsEl = e}
        ><ChildsArea childs={this.block.childs}></ChildsArea></td>
    }
}