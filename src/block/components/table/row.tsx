
import { BaseComponent } from "../../base/component";
import React from 'react';
import { Block } from "../../base";
import { url, view } from "../../factory/observable";
import { BlockAppear, BlockDisplay } from "../../base/enum";
@url('/table/row')
export class TableRow extends Block {
    appear = BlockAppear.layout;
    display = BlockDisplay.block;
    partName = 'row';
    get isRow() { return true }
}
@view('/table/row')
export class TableRowView extends BaseComponent<TableRow>{
    render() {
        return <tr>{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>)}</tr>
    }
}