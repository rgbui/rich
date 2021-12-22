import { Block } from "../../../../src/block";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import { TableSchema } from "../../schema/meta";
@url('/tablestore/board')
export class TableStoreBoard extends Block {
    @prop()
    columnId: string;
    @prop()
    schemaId: string;
    schema: TableSchema;
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