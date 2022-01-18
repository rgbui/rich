import { Block } from "../../../../src/block";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import { TableSchema } from "../../schema/meta";
@url('/tablestore/calendar')
export class TableStoreCalendar extends Block {
    @prop()
    schemaId: string;
    schema: TableSchema;
}
@view('/tablestore/calendar')
export class TableStoreCalendarView extends BlockView<TableStoreCalendar>{
    render() {
        return <div className='sy-tablestore-calendar'>

        </div>
    }
}