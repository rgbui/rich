import React from "react";
import { Block } from "../../../../src/block";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";

@url('/data-grid/gantt')
export class TableStoreCalendar extends Block {
    @prop()
    schemaId: string;
    schema: TableSchema;
}
@view('/data-grid/gantt')
export class TableStoreCalendarView extends BlockView<TableStoreCalendar>{
    render() {
        return <div className='sy-data-grid-gantt'>

        </div>
    }
}