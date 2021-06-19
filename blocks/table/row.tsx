
import { BlockView } from "../../src/block/component";
import React from 'react';
import { Block } from "../../src/block";
import { url, view } from "../../src/block/factory/observable";
import { BlockAppear, BlockDisplay } from "../../src/block/base/enum";
@url('/table/row')
export class TableRow extends Block {
    appear = BlockAppear.layout;
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