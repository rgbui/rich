import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import ArrowLeft from "../../../../src/assert/svg/chevronLeft.svg";
import ArrowRight from "../../../../src/assert/svg/chevronRight.svg";
import Plus from "../../../../src/assert/svg/plus.svg";
import React from 'react';
import dayjs, { Dayjs } from "dayjs";
import { DataGridBase } from "../base/table";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { TableStoreItem } from "../item";
import { ChildsArea } from "../../../../src/block/view/appear";
@url('/data-grid/calendar')
export class TableStoreCalendar extends DataGridBase {
    @prop()
    date: number = Date.now();
    @prop()
    dateFieldId: string;
    get dateField() {
        return this.schema.fields.find(g => g.id == this.dateFieldId);
    }
    async loadData() {
        if (this.schema) {
            var r = await this.schema.all({ page: 1, filter: { [this.dateField.name]: { $regex: dayjs(this.date).format('yyyy-MM') } } });
            if (r.data) {
                this.data = Array.isArray(r.data.list) ? r.data.list : [];
                this.total = r.data?.total || 0;
            }
        }
    }
    async createItem() {
        this.blocks.childs = [];
        for (let i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            var mark = row[this.dateField.name];
            var rowBlock: TableStoreItem = await BlockFactory.createBlock('/data-grid/item', this.page, { mark, dataRow: row }, this) as TableStoreItem;
            this.blocks.childs.push(rowBlock);
            await rowBlock.createElements();
        }
    }
}
@view('/data-grid/calendar')
export class TableStoreCalendarView extends BlockView<TableStoreCalendar>{
    renderMonth() {
        var dj = dayjs(this.block.date);
        var startDay = dj.startOf('M');
        var startWeek = startDay.startOf("w");
        var endDay = dj.endOf('M');
        var lastWeek = endDay.endOf('w');
        var days: Dayjs[] = [];
        var i = 0;
        while (true) {
            var d = startWeek.add(i, 'day');
            days.push(d);
            if (lastWeek.isSame(d, 'day')) {
                break;
            }
            i += 1;
        }
        var weeks: string[] = ['一', '二', '三', '四', '五', '六', '日'];
        return <>
            <div className="sy-data-grid-calendar-cells-head">{
                weeks.map(w => {
                    return <div key={w} className="sy-data-grid-calendar-cells-head-label">周{w}</div>
                })
            }
            </div>
            <div className="sy-data-grid-calendar-cells-days">
                {days.map((day, i) => {
                    var classList: string[] = ['sy-data-grid-calendar-cell'];
                    if (day.month() != dj.month()) {
                        classList.push('outside');
                    }
                    if (day.isSame(dj, 'day')) {
                        classList.push('selected')
                    }
                    var cs = this.block.childs.findAll(g => dayjs(g.mark).isSame(dayjs(day), 'day'))
                    return <div key={i} className={classList.join(" ")}
                    ><div className="sy-data-grid-calendar-cell-head"><label>{day.get('date')}</label><Plus></Plus></div>
                        <ChildsArea childs={cs}></ChildsArea>
                    </div>
                })}
            </div>
        </>
    }
    render() {
        return <div className='sy-data-grid-calendar'>
            <div className="sy-data-grid-calendar-head">
                <div className="sy-data-grid-calendar-head-date">
                    <label>{dayjs(this.block.date).format('yyyy年MM月')}</label>
                </div>
                <div className="sy-data-grid-calendar-head-operator">
                    <ArrowLeft></ArrowLeft>
                    <label>今天</label>
                    <ArrowRight></ArrowRight>
                </div>
            </div>
            <div className="sy-data-grid-calendar-cells">
                {this.renderMonth()}
            </div>
        </div>
    }
}