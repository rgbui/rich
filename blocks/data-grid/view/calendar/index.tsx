import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import dayjs, { Dayjs } from "dayjs";
import { DataGridView } from "../base";
import { FieldType } from "../../schema/type";
import { Icon } from "../../../../component/view/icon";
import { DataGridTool } from "../components/tool";
import { ChevronLeftSvg, ChevronRightSvg, CollectTableSvg, PlusSvg } from "../../../../component/svgs";
import { S } from "../../../../i18n/view";
import { lst } from "../../../../i18n/store";
import { Spin } from "../../../../component/view/spin";
import { Tip } from "../../../../component/view/tooltip/tip";
import { getPageIcon } from "../../../../src/page/declare";
import './style.less';

@url('/data-grid/calendar')
export class TableStoreCalendar extends DataGridView {
    date: number = Date.now();
    constructor(props) {
        super(props);
        this.date = Date.now();
    }
    async didMounted() {
        this.date = Date.now();
        await super.didMounted();
    }
    @prop()
    dateFieldId: string;
    get dateField() {
        return this.schema.fields.find(g => g.id == this.dateFieldId);
    }
    async loadData() {
        if (!this.dateFieldId) {
            this.dateFieldId = this.fields.find(g => [FieldType.date, FieldType.createDate].includes(g.field.type))?.field?.id;
            if (!this.dateFieldId)
                this.dateFieldId = this.schema.fields.find(g => [FieldType.date, FieldType.createDate].includes(g.type))?.id;
        }
        if (this.schema) {
            var start = dayjs(this.date).startOf('month').toDate();
            var end = dayjs(this.date).endOf('month').toDate();
            var r = await this.schema.all({
                page: 1,
                filter: {
                    [this.dateField.name]: {
                        $gte: start,
                        $lte: end
                    }
                }
            }, this.page.ws);
            if (r.data) {
                this.data = Array.isArray(r.data.list) ? r.data.list : [];
                this.total = r.data?.total || 0;
            }
        }
    }
    async createItem() {

    }
    async onPrevMonth() {
        var day = dayjs(this.date);
        var r = day.subtract(1, 'month');
        this.date = r.toDate().getTime();
        await this.loadData();
        this.forceUpdate();
    }
    async onNextMonth() {
        var day = dayjs(this.date);
        var r = day.subtract(-1, 'month');
        this.date = r.toDate().getTime();
        await this.loadData();
        this.forceUpdate();
    }
    async onAddCalendar(day) {
        await this.onOpenAddForm(undefined, undefined, undefined, { formData:{[this.dateField.name]: day.toDate()} });
    }
}

@view('/data-grid/calendar')
export class TableStoreCalendarView extends BlockView<TableStoreCalendar>{
    renderItems(day) {
        if (!this.block?.schema) return <></>
        var rs = this.block.data.filter(g => typeof g[this.block.dateField.name] != 'undefined' && dayjs(g[this.block.dateField.name]).isSame(day, 'day'))
        var title = this.block.schema.fields.find(g => g.type == FieldType.title);
        if (!title) title = this.block.schema.fields.find(g => g.type == FieldType.text);
        return <div className="sy-data-grid-calendar-items padding-w-10">
            {rs.map(r => {
                var d = dayjs(r[this.block.dateField.name])
                return <div onMouseDown={e => this.block.onOpenEditForm(r.id)} className="sy-data-grid-calendar-item flex gap-h-5" key={r.id}>
                    <Icon className={'flex-fixed gap-r-5 remark'} icon={getPageIcon(r.icon)} size={16}></Icon>
                    <span className="bold f-14 flex-auto text-overflow ">{r[title.name]}</span>
                    <span className="flex-fixed remark f-12">{d.format('HH:mm')}</span>
                </div>
            })}
        </div>
    }
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
        var now = dayjs();
        var weeks: string[] = [lst('周一'), lst('周二'), lst('周三'), lst('周四'), lst('周五'), lst('周六'), lst('周日')];
        return <>
            <div className="sy-data-grid-calendar-cells-head">{weeks.map(w => <div key={w} className="sy-data-grid-calendar-cells-head-label f-12">{w}</div>)}
            </div>
            <div className="sy-data-grid-calendar-cells-days">
                {days.map((day,i) =>{
                    var classList: string[] = ['sy-data-grid-calendar-cell', 'visible-hover'];
                    if (day.month() != dj.month()) {
                        classList.push('outside');
                    }
                    if (day.isSame(dj, 'day')) {
                        classList.push('selected')
                    }
                    return <div key={i} className={classList.join(" ")}
                    ><div className="sy-data-grid-calendar-cell-head ">
                            {this.block.isCanEdit() && <Tip text='添加记录'>
                                <span style={{ float: 'left' }} className="flex-center size-20 round gap-h-5 gap-w-10 visible item-bg-hover border bg-white cursor"><Icon className={'remark'} onClick={e => this.block.onAddCalendar(day)} icon={PlusSvg} size={18}></Icon></span>
                            </Tip>}
                            <label className={now.isSame(day, 'D') ? "now" : ""}>{day.get('date')}</label>
                        </div>
                        <div className="sy-data-grid-calendar-cell-content h-90 w100 overflow-y">
                            {this.renderItems(day)}
                        </div>
                    </div>
                })}
            </div>
        </>
    }
    renderCreateTable() {
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus padding-h-5 padding-w-10 cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            {this.block.willCreateSchema && <Spin></Spin>}
            <span className="size-24 flex-center remark"><Icon size={16} icon={{ name: 'byte', code: 'table' }}></Icon></span>
            <span className="remark"><S>创建数据表格</S></span>
        </div>
    }
    renderView() {
        var now = dayjs();
        var day = dayjs(this.block.date);
        return <div className='sy-data-grid-calendar' onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}>
            <DataGridTool block={this.block}></DataGridTool>
            <div className="sy-data-grid-calendar-head" onMouseDown={e => e.stopPropagation()}>
                <div className="sy-data-grid-calendar-head-date">
                    <label className="bold f-14">{day.format(lst('YYYY年MM月'))}</label>
                </div>
                <div className="sy-data-grid-calendar-head-operator">
                    <span className="icon"><Icon size={16} onClick={e => this.block.onPrevMonth()} icon={ChevronLeftSvg}></Icon></span>
                    <label className="f-14">{now.isSame(day, 'date') ? lst("今天") : (day.get('date'))}</label>
                    <span className="icon"><Icon size={16} onClick={e => this.block.onNextMonth()} icon={ChevronRightSvg}></Icon></span>
                </div>
            </div>
            <div className="sy-data-grid-calendar-cells">
                {this.renderMonth()}
            </div>
            {this.renderCreateTable()}
        </div>
    }
}