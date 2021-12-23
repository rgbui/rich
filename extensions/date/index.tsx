import React, { CSSProperties } from "react";
/**
 * https://dayjs.gitee.io/docs/zh-CN/installation/installation
 * 
 */
import dayjs, { Dayjs } from "dayjs";
import { EventsComponent } from "../../component/lib/events.component";

import chevronLeft from "../../src/assert/svg/chevronLeft.svg";
import chevronRight from "../../src/assert/svg/chevronRight.svg";
import { Icon } from "../../component/view/icon";
import "./style.less";
import { PopoverPosition } from "../popover/position";
import { PopoverSingleton } from "../popover/popover";

export class DatePicker extends EventsComponent {
    private date: Date = new Date();
    open(date: Date, options?: {}) {
        this.mode = 'month';
        this.isInEditing = false;
        if (typeof date == 'string') date = new Date(date);
        if (!date) date = new Date();
        this.date = date;
        this.forceUpdate()
    }
    private renderDays(): JSX.Element {
        var dj = dayjs(this.date);
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
        return <div className='shy-date-picker-days'>
            <div className='shy-date-picker-days-week'>
                {weeks.map(we => {
                    return <a key={we}>{we}</a>
                })}
            </div>
            <div className='shy-date-picker-days-day'>
                {days.map((day, i) => {
                    var classList: string[] = [];
                    if (day.month() != dj.month()) {
                        classList.push('outside');
                    }
                    if (day.isSame(dj, 'day')) {
                        classList.push('selected')
                    }
                    return <a key={i} className={classList.join(" ")}
                        onClick={e => this.setDay(day)}>{day.get('date')}</a>
                })}
            </div>
        </div>
    }
    private isInEditing: boolean = false;
    private mode: 'month' | 'year' = 'month'
    setDay(date: Dayjs) {
        this.isInEditing = true;
        this.date = date.toDate();
        this.onChange();
        this.onSave();
    }
    onSave() {
        this.emit('save', this.date);
    }
    onChange() {
        this.emit('change', this.date);
        this.forceUpdate();
    }
    onAdd(event: React.MouseEvent) {
        if (event) event.preventDefault()
        this.isInEditing = true;
        if (this.mode == 'month') {
            var m = this.date.getMonth() + 1;
            if (m > 12) m = 1;
            this.date.setMonth(m)
        }
        else {
            this.date.setFullYear(this.date.getFullYear() + 1);
        }
        this.onChange();
    }
    setMode(mode: 'year' | 'month') {
        this.mode = mode;
        this.isInEditing = true;
        this.forceUpdate()
    }
    onReduce(event: React.MouseEvent) {
        if (event) event.preventDefault()
        this.isInEditing = true;
        if (this.mode == 'month') {
            var m = this.date.getMonth() - 1;
            if (m == -1) m = 11;
            this.date.setMonth(m)
        }
        else {
            this.date.setFullYear(this.date.getFullYear() - 1);
        }
        this.onChange();
    }
    render() {
        var dj = dayjs(this.date);
        return <div className='shy-date-picker'>
            <div className='shy-date-picker-head'>
                <div className='shy-date-picker-head-title'>
                    <span style={{ cursor: 'pointer' }} onMouseDown={e => this.setMode('year')} className={this.mode == 'year' ? "hover" : ""}>{dj.year()}年</span>
                    <span style={{ cursor: 'pointer' }} onMouseDown={e => this.setMode('month')} className={this.mode == 'month' && this.isInEditing ? "hover" : ""}>{dj.month() + 1}月</span>
                    <span>{dj.date()}日</span>
                </div>
                <div className='shy-date-picker-head-operators'>
                    <a><Icon size={14} click={e => this.onReduce(e)} icon={chevronLeft}></Icon></a>
                    <a><Icon size={14} click={e => this.onAdd(e)} icon={chevronRight}></Icon></a>
                </div>
            </div>
            {this.renderDays()}
        </div>
    }
    private onClose() {
        this.emit('close');
    }
}
export interface DatePicker {
    only(name: 'change', fn: (data: Date) => void);
    emit(name: 'change', data: Date);
    only(name: 'save', fn: (data: Date) => void);
    emit(name: 'save', data: Date);
    only(name: 'close', fn: () => void);
    emit(name: 'close');
}
export async function useDatePicker(pos: PopoverPosition, date: Date, options?: {}) {
    let popover = await PopoverSingleton(DatePicker);
    let datePicker = await popover.open(pos);
    datePicker.open(date, options);
    return new Promise((resolve: (date: Date) => void, reject) => {
        datePicker.only('save', (data) => {
            popover.close();
            resolve(data);
        });
        popover.only('close', () => {
            resolve(undefined)
        })
        datePicker.only('close', () => {
            popover.close();
            resolve(undefined);
        });
    })
}