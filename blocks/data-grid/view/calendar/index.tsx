import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import dayjs, { Dayjs } from "dayjs";
import { DataGridView } from "../base";
import { FieldType } from "../../schema/type";
import { Icon } from "../../../../component/view/icon";
import { DataGridTool } from "../components/tool";
import {
    ChevronLeftSvg,
    ChevronRightSvg,
    PlusSvg
} from "../../../../component/svgs";
import { S } from "../../../../i18n/view";
import { lst } from "../../../../i18n/store";
import { Spin, SpinBox } from "../../../../component/view/spin";
import { Tip } from "../../../../component/view/tooltip/tip";
import './style.less';
import { TableStoreCalendarItem } from "./item";
import { ChildsArea } from "../../../../src/block/view/appear";
import { TableGridItem } from "../item";
import { Divider } from "../../../../component/view/grid";
import { ToolTip } from "../../../../component/view/tooltip";
import { GenreConsistency } from "../../../../net/genre";
import { DropDirection } from "../../../../src/kit/handle/direction";
import { Block } from "../../../../src/block";


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
    size: number = 500;
    @prop()
    dateFieldId: string;
    @prop()
    dateFormat: 'month' | 'week' = 'month'
    get dateField() {
        if (this.schema)
            return this.schema.fields.find(g => g.id == this.dateFieldId);
    }
    async loadData() {
        if (!this.dateFieldId) {
            this.dateFieldId = this.fields.find(g => [FieldType.date, FieldType.createDate].includes(g.field.type))?.field?.id;
            if (!this.dateFieldId)
                this.dateFieldId = this.schema.fields.find(g => [FieldType.date, FieldType.createDate].includes(g.type))?.id;
        }
        if (this.schema) {
            var start = dayjs(this.date).startOf(this.dateFormat).toDate();
            var end = dayjs(this.date).endOf(this.dateFormat).toDate();
            var r = await this.schema.list({
                page: this.pageIndex,
                size: this.size,
                filter: this.getSearchFilter(),
                sorts: this.getSearchSorts(),
                directFilter: {
                    [this.dateField.name]: {
                        $gte: start,
                        $lte: end
                    }
                }
            }, this.page.ws);
            if (r.data) {
                this.data = Array.isArray(r.data.list) ? r.data.list : [];
                this.total = r.data?.total || 0;
                this.size = r.data.size;
                this.pageIndex = r.data.page;
            }
        }
    }
    async loadRelationDatas() {

    }
    async loadDataInteraction() {

    }
    async onNow() {
        this.date = Date.now();
        this.forceManualUpdate();
        this.onLazy100ReloadData();
    }
    async onPrevMonth() {
        var day = dayjs(this.date);
        var r = day.subtract(1, this.dateFormat);
        this.date = r.toDate().getTime();
        this.forceManualUpdate();
        this.onLazy100ReloadData();
    }
    async onNextMonth() {
        var day = dayjs(this.date);
        var r = day.subtract(-1, this.dateFormat);
        this.date = r.toDate().getTime();
        this.forceManualUpdate();
        this.onLazy100ReloadData();
    }
    async onAddCalendar(day) {
        var props: Record<string, any> = {}
        if (this.dateField.type == FieldType.date)
            props[this.dateField.name] = day.toDate();
        await this.onOpenAddForm(undefined, undefined, undefined, { formData: { ...props } });
    }
    async onChangeFormat(f) {
        await this.onUpdateProps({ dateFormat: f });
        this.forceManualUpdate();
        this.onLazy100ReloadData();
    }
    onDrag(event: React.MouseEvent, block: TableGridItem) {
        if (this.dateField.type == FieldType.date && this.dataGridIsCanEdit()) {
            this.page.kit.handle.onDirectDrag(block, event.nativeEvent, {
                isOnlyDrag: true,
                notDragFun: (ev) => {
                    this.onOpenEditForm(block.dataId)
                }
            });
        }
        else this.onOpenEditForm(block.dataId)
    }
    async drop(blocks: Block[],
        direction: DropDirection,
        dropData?: Record<string, any>) {

        var dragRow = blocks[0] as TableGridItem;
        if (direction == DropDirection.inner && dropData && Object.keys(dropData).length > 0) {
            var ke = Object.keys(dropData)[0];
            await this.schema.rowUpdate({ dataId: dragRow.dataRow.id, data: dropData }, this?.id);
            var d = dragRow.dataGrid.data.find(c => c.id == dragRow.dataRow.id);
            Object.assign(d, dropData);
            this.forceManualUpdate();
            return;
        }
        await super.drop(blocks, direction, dropData);
    }
}

@view('/data-grid/calendar')
export class TableStoreCalendarView extends BlockView<TableStoreCalendar> {
    renderItems(day) {
        if (!this.block?.schema) return <></>
        var rs = this.block.childs.filter(g => typeof (g as TableStoreCalendarItem).dataRow[this.block.dateField.name] != 'undefined' && dayjs((g as TableStoreCalendarItem).dataRow[this.block.dateField.name]).isSame(day, 'day'))
        var title = this.block.schema.fields.find(g => g.type == FieldType.title);
        if (!title) title = this.block.schema.fields.find(g => g.type == FieldType.text);
        return <div className="sy-data-grid-calendar-items padding-w-10">
            <ChildsArea childs={rs}></ChildsArea>
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
        if (window.shyConfig?.isUS) {
            weeks = [lst('周日'), lst('周一'), lst('周二'), lst('周三'), lst('周四'), lst('周五'), lst('周六')];
        }
        return <>
            <div className="sy-data-grid-calendar-cells-head">{weeks.map(w => <div key={w} className="sy-data-grid-calendar-cells-head-label f-14">{w}</div>)}
            </div>
            <div className="sy-data-grid-calendar-cells-days flex">
                {days.map((day, i) => {
                    var classList: string[] = ['sy-data-grid-calendar-cell', 'visible-hover'];
                    var isMonth = true;
                    if (day.month() != dj.month()) {
                        isMonth = false;
                    }
                    return <div data-block-drop-panel={JSON.stringify(GenreConsistency.transform({
                        [this.block.dateField?.name]: day.toDate()
                    }))} key={i} className={classList.join(" ")}
                    ><div className="sy-data-grid-calendar-cell-head ">
                            {this.block.isCanEdit() && <Tip text='添加记录'>
                                <span style={{ float: 'right' }} className="flex-center size-20 round gap-h-5 gap-w-10 visible item-bg-hover border bg-white cursor"><Icon className={'remark'} onClick={e => this.block.onAddCalendar(day)} icon={PlusSvg} size={18}></Icon></span>
                            </Tip>}
                            <label className={(isMonth ? "" : "remark ") + (now.isSame(day, 'D') ? "now" : "")}>{day.get('date')}</label>
                        </div>
                        <div className="sy-data-grid-calendar-cell-content h-90 w100 overflow-y">
                            {this.renderItems(day)}
                        </div>
                    </div>
                })}
            </div>
        </>
    }
    renderWeek() {
        var days: Dayjs[] = [];
        var dj = dayjs(this.block.date);
        var startDay = dj.startOf('w');
        var endDay = dj.endOf('w');
        var i = 0;
        while (true) {
            var d = startDay.add(i, 'day');
            days.push(d);
            if (endDay.isSame(d, 'day')) {
                break;
            }
            i += 1;
        }
        var now = dayjs();
        var weeks: string[] = [lst('周一'), lst('周二'), lst('周三'), lst('周四'), lst('周五'), lst('周六'), lst('周日')];
        if (window.shyConfig?.isUS) {
            weeks = [lst('周日'), lst('周一'), lst('周二'), lst('周三'), lst('周四'), lst('周五'), lst('周六')];
        }
        return <>
            <div className="sy-data-grid-calendar-cells-head">{weeks.map(w => <div key={w} className="sy-data-grid-calendar-cells-head-label f-14">{w}</div>)}
            </div>
            <div className="sy-data-grid-calendar-cells-days flex-full">
                {days.map((day, i) => {
                    var classList: string[] = ['sy-data-grid-calendar-cell', 'visible-hover'];
                    var isMonth = true;
                    if (day.month() != dj.month()) {
                        isMonth = false;
                    }
                    return <div data-block-drop-panel={JSON.stringify(GenreConsistency.transform({
                        [this.block.dateField?.name]: day.toDate()
                    }))} key={i} style={{ minHeight: 124, height: 'auto' }} className={classList.join(" ")}
                    ><div className="sy-data-grid-calendar-cell-head ">
                            {this.block.isCanEdit() && <Tip text='添加记录'>
                                <span style={{ float: 'right' }} className="flex-center size-20 round gap-h-5 gap-w-10 visible item-bg-hover border bg-white cursor"><Icon className={'remark'} onClick={e => this.block.onAddCalendar(day)} icon={PlusSvg} size={18}></Icon></span>
                            </Tip>}
                            <label className={(isMonth ? "" : "remark ") + (now.isSame(day, 'D') ? "now" : "")}>{day.get('date')}</label>
                        </div>
                        <div className="sy-data-grid-calendar-cell-content min-h-90 w100 overflow-y">
                            {this.renderItems(day)}
                        </div>
                    </div>
                })}
            </div>
        </>
    }
    renderCreateTable() {
        if (this.block.isLoading) return <Spin block></Spin>
        return !this.block.schema && this.block.page.isCanEdit&& <div className="item-hover item-hover-focus padding-5 cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            {this.block.willCreateSchema && <Spin></Spin>}
            <span className="size-24 flex-center remark"><Icon size={16} icon={{ name: 'byte', code: 'table' }}></Icon></span>
            <span className="remark"><S>添加或创建数据表</S></span>
        </div>
    }
    renderView() {
        var day = dayjs(this.block.date);
        var text = day.format(lst('YYYY年MM月'));
        if (this.block.dateFormat == 'week') {
            text = day.format(lst('YYYY/MM')) + ' ' + lst('第{count}周', { count: day.week() });
        }
        return <div style={this.block.visibleStyle}>
            <div style={this.block.contentStyle} >
                <div className='sy-data-grid-calendar'
                    onMouseMove={e => this.block.onOver(true)}
                    onMouseEnter={e => this.block.onOver(true)}
                    onMouseLeave={e => this.block.onOver(false)}>
                    <DataGridTool block={this.block}></DataGridTool>
                    {!this.block.noTitle && <>
                        <Divider hidden={this.block.dataGridTab ? true : false}></Divider>
                        {!this.block.dataGridTab && <div className="padding-5"></div>}
                    </>}
                    {this.renderCreateTable()}
                    <SpinBox spin={this.block.isLoadingData}>
                        <div className="flex" onMouseDown={e => e.stopPropagation()}>
                            <div className="flex-auto">
                                <label className="bold f-16">{text}</label>
                            </div>
                            <div className="flex-fixed flex">
                                <label className="border-light gap-r-10 cursor f-14  bg-hover  padding-w-10 round h-24 flex-center" onMouseDown={e => this.block.onNow()}>{this.block.dateFormat == 'month' ? lst('本月') : lst('本周')}</label>
                                <ToolTip overlay={this.block.dateFormat == 'month' ? <S>上个月</S> : <S>上一周</S>}><span className="border-light  gap-r-10   cursor bg-hover   round size-24 flex-center" onClick={e => this.block.onPrevMonth()}><Icon size={16} icon={ChevronLeftSvg}></Icon></span></ToolTip>
                                <ToolTip overlay={this.block.dateFormat == 'month' ? <S>下个月</S> : <S>下一周</S>}><span className="border-light   gap-r-10  cursor bg-hover   round size-24 flex-center" onClick={e => this.block.onNextMonth()} ><Icon size={16} icon={ChevronRightSvg}  ></Icon></span></ToolTip>
                                <span className="border-light f-14    round h-24 flex-center">
                                    <span className={"padding-w-5 cursor " + (this.block.dateFormat == 'week' ? "bg" : "bg-hover")} onMouseDown={e => this.block.onChangeFormat('week')}><S>周</S></span>
                                    <span className={"padding-w-5 cursor " + (this.block.dateFormat == 'month' ? "bg" : "bg-hover")} onMouseDown={e => this.block.onChangeFormat('month')}><S>月</S></span>
                                </span>
                            </div>
                        </div>
                        <div className="sy-data-grid-calendar-cells">
                            {this.block.dateFormat == 'month' && this.renderMonth()}
                            {this.block.dateFormat == 'week' && this.renderWeek()}
                        </div>
                    </SpinBox>
                </div>
            </div>
            {this.renderComment()}
        </div>

    }
}