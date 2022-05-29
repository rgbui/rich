import React from "react";
/**
 * https://dayjs.gitee.io/docs/zh-CN/installation/installation
 * 
 */
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { EventsComponent } from "../../component/lib/events.component";
import chevronLeft from "../../src/assert/svg/chevronLeft.svg";
import chevronRight from "../../src/assert/svg/chevronRight.svg";
import { Icon } from "../../component/view/icon";
import "./style.less";
import { PopoverPosition } from "../popover/position";
import { PopoverSingleton } from "../popover/popover";
import { Divider } from "../../component/view/grid";
dayjs.extend(customParseFormat);
export class DatePicker extends EventsComponent {
    date: Date = new Date();
    includeTime: boolean = false;
    open(date: Date, options?: { includeTime?: boolean }) {
        if (typeof date == 'string') date = new Date(date);
        if (!date) date = new Date();
        this.date = date;
        if (typeof options != 'undefined') {
            if (typeof options.includeTime == 'boolean') this.includeTime = options.includeTime
        }
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
    setDay(date: Dayjs) {
        if (this.includeTime == true) {
            var dm = dayjs(this.date);
            var dj = date.clone();
            dj = dj.hour(dm.hour());
            dj = dj.minute(dm.minute());
            dj = dj.second(0);
            dj = dj.millisecond(0);
            this.date = dj.toDate();
        }
        else {
            var dj = date.clone();
            dj = dj.hour(0);
            dj = dj.minute(0);
            dj = dj.second(0);
            dj = dj.millisecond(0);
            this.date = dj.toDate();
        }
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
        this.date = dayjs(this.date).add(1, 'M').toDate();
        this.updateInput();
        this.onChange();
    }
    onClear() {
        this.emit('clear');
    }
    onReduce(event: React.MouseEvent) {
        if (event) event.preventDefault()
        this.date = dayjs(this.date).subtract(1, 'M').toDate();
        this.updateInput();
        this.onChange();
    }
    changeDate(value: string) {
        value = value.trim();
        var v = dayjs(value, "YYYY/MM/DD");
        this.error = '';
        if (!v.isValid() || (v.month() >= 12 || v.month() < 0 || v.date() > 31 || v.date() <= 0)) {
            this.error = '解析日期错误';
            this.forceUpdate();
        }
        else {
            var dj = dayjs(this.date);
            dj = dj.year(v.year());
            dj = dj.month(v.month());
            dj = dj.date(v.date());
            this.date = dj.toDate();
            this.forceUpdate();
        }
    }
    changeTime(value: string) {
        value = value.trim();
        var v = dayjs('2008/09/01 ' + value, "YYYY/MM/DD HH:mm");
        this.error = '';
        if (!v.isValid() || (v.hour() < 0 || v.hour() > 23 || v.minute() < 0 || v.minute() > 59)) {
            this.error = '解析日期错误';
            this.forceUpdate();
        }
        else {
            var dj = dayjs(this.date);
            dj = dj.hour(v.hour());
            dj = dj.minute(v.minute());
            dj = dj.second(0);
            this.date = dj.toDate();
            this.forceUpdate();
        }
    }
    error: string = '';
    inputDate: HTMLInputElement;
    inputTime: HTMLInputElement;
    private updateInput() {
        var dj = dayjs(this.date);
        this.inputDate.value = dj.format('YYYY/MM/DD');
        if (this.inputTime)
            this.inputTime.value = dj.format('HH:mm')
    }
    render() {
        var dj = dayjs(this.date);
        return <div className='shy-date-picker'>
            {this.error && <div className="shy-date-picker-error">{this.error}</div>}
            <div className={"shy-date-picker-input" + (this.error ? " shy-date-picker-input-error" : "")}>
                <div><input type='text' ref={e => this.inputDate = e} defaultValue={dj.format('YYYY/MM/DD')} onBlur={e => this.changeDate((e.target as HTMLInputElement).value)} /></div>
                {this.includeTime && <><span></span><div><input ref={e => this.inputTime = e} type='text' defaultValue={dj.format('HH:mm')} onBlur={e => this.changeTime((e.target as HTMLInputElement).value)} /></div></>}
            </div>
            <div className='shy-date-picker-head'>
                <div className='shy-date-picker-head-title'>
                    <span style={{ cursor: 'pointer' }}>{dj.year()}年</span>
                    <span style={{ cursor: 'pointer' }}>{dj.month() + 1}月</span>
                    <span>{dj.date()}日</span>
                </div>
                <div className='shy-date-picker-head-operators'>
                    <a><Icon size={14} click={e => this.onReduce(e)} icon={chevronLeft}></Icon></a>
                    <a><Icon size={14} click={e => this.onAdd(e)} icon={chevronRight}></Icon></a>
                </div>
            </div>
            {this.renderDays()}
            <Divider></Divider>
            <div className="shy-date-picker-clear" onClick={e => this.onClear()}>
                清理
            </div>
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
    only(name: 'clear', fn: () => void);
    emit(name: 'clear');
}
export async function useDatePicker(pos: PopoverPosition, date: Date, options?: { includeTime?: boolean }) {
    let popover = await PopoverSingleton(DatePicker);
    let datePicker = await popover.open(pos);
    datePicker.open(date, options);
    return new Promise((resolve: (date: Date) => void, reject) => {
        datePicker.only('save', (data) => {
            popover.close();
            resolve(data);
        });
        popover.only('close', () => {
            resolve(datePicker.date);
        });
        datePicker.only('clear', () => {
            popover.close();
            resolve(null);
        })
    })
}