import React from "react";
import { Block } from "../../../../src/block";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";

@url('/data-grid/timeline')
export class TableStoreCalendar extends Block {
    @prop()
    schemaId: string;
    schema: TableSchema;
}
@view('/data-grid/timeline')
export class TableStoreCalendarView extends BlockView<TableStoreCalendar>{
    render() {
        return <div className='sy-data-grid-timeline'>

        </div>
    }
}