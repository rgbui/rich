
import { BlockView } from "../../src/block/view";
import React from 'react';
import { Block } from "../../src/block";
import { url, view } from "../../src/block/factory/observable";
import {  BlockDisplay } from "../../src/block/enum";
@url('/table/row')
export class TableRow extends Block {
    display = BlockDisplay.block;
    partName = 'row';
    get isRow() { return true }
}
@view('/table/row')
export class TableRowView extends BlockView<TableRow>{
    render() {
        return <tr>{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>)}</tr>
    }
}