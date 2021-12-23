import React from "react";
import { Block } from "../../../../src/block";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
@url('/tablestore/operator')
export class TableStoreOperator extends Block {

}
@view('/tablestore/operator')
export class TableStoreOperatorView extends BlockView<TableStoreOperator>{
    render() {
        return <div className='sy-tablestore-operator'><ChildsArea childs={this.block.childs}></ChildsArea></div>
    }
}