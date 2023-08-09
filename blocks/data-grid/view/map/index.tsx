import React from "react";
import { Block } from "../../../../src/block";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
@url('/data-grid/map')
export class TableStoreBoard extends Block {
    
}
@view('/data-grid/map')
export class TableStoreBoardView extends BlockView<TableStoreBoard>{
    renderView()  {
        return <div className='sy-data-grid-board'>

        </div>
    }
}