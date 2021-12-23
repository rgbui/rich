import React from "react";
import { Block } from "../../../../src/block";
import { BlockDisplay } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";

@url('/tablestore/search')
export class TableStoreSearch extends Block {
    display = BlockDisplay.block;
}
@view('/tablestore/search')
export class TableStoreSearchView extends BlockView<TableStoreSearch>{
    render() {
        return <div className='sy-tablestore-search'><ChildsArea childs={this.block.childs}></ChildsArea></div>
    }
}