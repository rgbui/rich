import { Block } from "../../../../src/block";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
@url('/data-grid/calendar')
export class TableStoreCalendar extends Block {

}
@view('/data-grid/calendar')
export class TableStoreCalendarView extends BlockView<TableStoreCalendar>{
    render() {
        return <div className='sy-data-grid-calendar'>
            <div className="sy-data-grid-calendar-head">
                <div className="sy-data-grid-calendar-head-operator">
                    <label>日</label>
                    <label>周</label>
                    <label>年</label>
                </div>
                <label>今天</label>
                <div className="sy-data-grid-calendar-head-date"></div>
            </div>
            <div className="sy-data-grid-calendar-cells">

            </div>
        </div>
    }
}