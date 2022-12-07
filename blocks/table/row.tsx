
import { BlockView } from "../../src/block/view";
import React from 'react';
import { Block } from "../../src/block";
import { url, view } from "../../src/block/factory/observable";
import { BlockDisplay } from "../../src/block/enum";
import { Table } from "./index";

@url('/table/row')
export class TableRow extends Block {
    display = BlockDisplay.block;
    partName = 'row';
    get isRow() { return true }
    get table() {
        return this.parent as Table;
    }
    get isCanDrop() {
        return false;
    }
    get handleBlock(){
        return this.table;
    }
}
@view('/table/row')
export class TableRowView extends BlockView<TableRow>{
    render() {
        var style = this.block.pattern.style;
        return <tr style={style}>{this.block.childs.map(x =><x.viewComponent key={x.id} block={x}></x.viewComponent>)}</tr>
    }
}