import React from "react";
import { Block } from "../../../../src/block";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";

@url('/tablestore/board/column')
export class TableStoreBoardColumn extends Block {

}
@view('/tablestore/board/column')
export class TableStoreBoardColumnView extends BlockView<TableStoreBoardColumn>{
    render() {
        return <div className='sy-tablestore-board-column'>

        </div>
    }
}