import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableGridItem } from "../item";
import React from "react";
import { Icon } from "../../../../component/view/icon";
import { getPageIcon } from "../../../../src/page/declare";
import { TableStoreCalendar } from ".";

@url('/data-grid/calendar/item')
export class TableStoreCalendarItem extends TableGridItem {
    get isShowHandleBlock(): boolean {
        return false
    }
}

@view('/data-grid/calendar/item')
export class TableStoreListItemView extends BlockView<TableStoreCalendarItem> {
    renderView() {
        var dg = this.block.dataGrid as TableStoreCalendar;
        return <div onMouseDown={e => {
            dg.onDrag(e, this.block);
        }} className="sy-data-grid-calendar-item flex gap-h-5" >
            <Icon className={'flex-fixed gap-r-5 remark'} icon={getPageIcon(this.block.dataRow.icon)} size={16}></Icon>
            <span className="bold f-14 flex-auto text-overflow ">{this.block.dataRow.title}</span>
        </div>
    }
}