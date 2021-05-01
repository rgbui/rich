import { BaseComponent } from "../../base/component";
import React from 'react';
import { prop, url, view } from "../../factory/observable";
import { ChildsArea, TextArea } from "../../base/appear";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { Block } from "../..";
@url('/table/cell')
export class TableCell extends Block {
    @prop()
    rowspan: number = 1;
    @prop()
    colspan: number = 1;
    display = BlockDisplay.block;
    appear = BlockAppear.none;
    partName = 'cell';
    get isLayout() {
        if (this.childs.length > 0) return true;
        else return false;
    }
    get isText() {
        if (this.childs.length > 0) return false;
        else return true;
    }
    get isSolid() {
        return false;
    }
    get isCol() {
        return true;
    }
}
@view('/table/cell')
export class TableCellView extends BaseComponent<TableCell>{
    render() {
        var style: Record<string, any> = {

        };
        if (this.block.childs.length > 0)
            return <td style={style}
                rowSpan={this.block.rowspan == 1 ? undefined : this.block.rowspan}
                colSpan={this.block.colspan == 1 ? undefined : this.block.colspan}
                ref={e => this.block.childsEl = e}
            ><ChildsArea childs={this.block.childs}></ChildsArea></td>
        else return <td style={style} rowSpan={this.block.rowspan} colSpan={this.block.colspan}>
            <TextArea html={this.block.htmlContent}></TextArea>
        </td>
    }
}