
import { BaseComponent } from "../../base/component";
import React from 'react';
import { BaseBlock } from "../../base";
import { url, view } from "../../factory/observable";
@url('/table/row')
export class TableRow extends BaseBlock {

}
@view('/table/row')
export class TableRowView extends BaseComponent<TableRow>{
    render() {
        return <tr>{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>)}</tr>
    }
}