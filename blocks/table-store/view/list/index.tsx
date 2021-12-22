import React from "react";
import { Block } from "../../../../src/block";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";

@url('/tablestore/list')
export class TableStoreBoard extends Block {
    @prop()
    schemaId: string;
    schema: TableSchema;
    blocks = { childs: [], columns: [] };
    get blockKeys() {
        return ['childs', 'columns'];
    }
}
@view('/tablestore/list')
export class TableStoreBoardView extends BlockView<TableStoreBoard>{
    render() {
        return <div className='sy-tablestore-board'>
            
        </div>
    }
}