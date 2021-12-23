import React from "react";
import { Block } from "../../../../src/block";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";

@url('/tablestore/item')
export class TableStoreItem extends Block {

}
@view('/tablestore/item')
export class TableStoreBoardView extends BlockView<TableStoreItem>{
    render() {
        return <div className='sy-tablestore-item'>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}