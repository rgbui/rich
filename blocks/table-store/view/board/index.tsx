import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import { TableStoreBase } from "../base/table";
@url('/tablestore/board')
export class TableStoreBoard extends TableStoreBase {
    @prop()
    columnId: string;
    blocks = { childs: [], columns: [] };
    get blockKeys() {
        return ['childs', 'columns'];
    }
}
@view('/tablestore/board')
export class TableStoreBoardView extends BlockView<TableStoreBoard>{
    render() {
        return <div className='sy-tablestore-board'>

        </div>
    }
}