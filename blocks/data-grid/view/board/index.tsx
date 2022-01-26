import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import { TableStoreBase } from "../base/table";
@url('/data-grid/board')
export class TableStoreBoard extends TableStoreBase {
    blocks = { childs: [] };
}
@view('/data-grid/board')
export class TableStoreBoardView extends BlockView<TableStoreBoard>{
    render() {
        return <div className='sy-data-grid-board'>

        </div>
    }
}