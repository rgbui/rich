import dayjs from "dayjs";
import React from "react";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { FieldType } from "../../schema/type";
import { DataGridView } from "../base/table";
import { TableStoreBoard } from "../board";
import { TableStoreItem } from "../item";
import "./style.less";

@url('/data-grid/timeline')
export class TableStoreCalendar extends DataGridView {
    @prop()
    startDate: number;
    @prop()
    endDate: number;
    @prop()
    mode: 'day' | 'week' | 'year' = 'day';
    dateFieldId: string;
    get dateField() {
        return this.schema.fields.find(g => g.id == this.dateFieldId);
    }
    dataGroups: { group: string, count: number }[] = [];
    getModeValue(row) {
        var name = this.dateField.name;
        var value = row[name];
        if (value instanceof Date) {
            var key;
            if (this.mode == 'year') { key = value.getFullYear() }
            else if (this.mode == 'day') { key = dayjs(value).format('YYYY-MM-DD') }
            return key;
        }
    }
    async loadData() {
        if (!this.startDate) {
            this.startDate = Date.now() - 1000 * 60 * 60 * 24 * 365;
            this.endDate = Date.now();
        }
        if (!this.dateFieldId) {
            this.dateFieldId = this.fields.find(g => g.field.type == FieldType.date)?.field?.id;
        }
        if (this.dateField) {
            if (this.schema) {
                var name = this.dateField.name;
                var r = await this.schema.list({
                    page: 1,
                    filter: { [name]: { $gte: new Date(this.startDate), $lte: new Date(this.endDate) } }
                });
                if (r.ok) {
                    this.data = r.data.list;
                    console.log(this.data, 'data');
                    r.data.list.forEach(row => {
                        var value = this.getModeValue(row);
                        if (value) {
                            if (!this.dataGroups.some(s => s.group == value)) {
                                this.dataGroups.push({ group: value, count: 1 })
                            }
                            else {
                                var dg = this.dataGroups.find(g => g.group == value);
                                if (dg) dg.count += 1;
                            }
                        }
                    })
                }
            }
        }
    }
    async createItem() {
        this.blocks.childs = [];
        for (let i = 0; i < this.dataGroups.length; i++) {
            var dg = this.dataGroups[i];
            var list = this.data.findAll(g => {
                var value = this.getModeValue(g);
                if (value) return dg.group == value;
            })
            await list.eachAsync(async row => {
                var rowBlock: TableStoreItem = await BlockFactory.createBlock('/data-grid/item', this.page, { mark: dg.group, dataRow: row }, this) as TableStoreItem;
                this.blocks.childs.push(rowBlock);
                await rowBlock.createElements();
            })
        }
    }
}
@view('/data-grid/timeline')
export class TableStoreCalendarView extends BlockView<TableStoreCalendar>{
    renderGroup(dg: ArrayOf<TableStoreBoard['data']>, index: number) {
        var cs = this.block.childs.findAll(g => g.mark == dg.group);
        return <div className="sy-data-grid-timeline-group" key={index}>
            <div className="sy-data-grid-timeline-group-line"></div>
            <div className="sy-data-grid-timeline-group-circle"></div>
            <div className="sy-data-grid-timeline-group-head"><span>{dg.group}</span><label>{dg.count}</label></div>
            <div className="sy-data-grid-timeline-group-childs">
                <ChildsArea childs={cs}></ChildsArea>
            </div>
        </div>
    }
    render() {
        return <div className='sy-data-grid-timeline'>
            <div className='sy-data-grid-timelines'>{this.block.dataGroups.map((dg, i) => {
                return this.renderGroup(dg, i)
            })}</div>
        </div>
    }
}