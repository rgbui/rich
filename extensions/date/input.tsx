import dayjs from "dayjs";
import React from "react";
import { lst } from "../../i18n/store";
import { Rect } from "../../src/common/vector/point";
import { useDatePicker } from ".";
import "./style.less";
import { useSelectMenuItem } from "../../component/view/menu";
import lodash from "lodash";
import { MenuItemType } from "../../component/view/menu/declare";
import { PopoverPosition } from "../../component/popover/position";

export class DateInput extends React.Component<{ value: Date, format?: string, onChange: (e: Date) => void }>{
    render() {
        var self = this;
        async function mousedown(e: React.MouseEvent) {
            var r = await useDatePicker({ roundArea: Rect.fromEvent(e) }, self.props.value);
            if (r) {
                self.props.onChange(r);
            }
        }
        var format = this.props.format || 'YYYY/MM/DD';
        return <div className="shy-date-input" onMouseDown={e => mousedown(e)} >
            <span className="cursor"> {this.props.value ? dayjs(this.props.value).format(format) : lst('选择时间')}</span>
        </div>
    }
}

export class DynamicDateInput extends React.Component<{
    value: number | string,
    format?: string,
    mode: 'year' | 'month' | 'day' | 'hour' | 'week',
    size?: 'small' | 'default' | 'large',
    onChange: (e: number | string) => void
}>{
    render() {
        var self = this;
        var options = [
            { text: lst('具体时间'), value: null },
            { type: MenuItemType.divide },
            { text: lst('1小时前'), value: '-1H' },
            { text: lst('1小时后'), value: '1H' },
            { text: lst('明天'), value: '1D' },
            { text: lst('今天'), value: '0D' },
            { text: lst('昨天'), value: '-1D' },
            { text: lst('明天'), value: '1D' },
            { text: lst('下周'), value: 'C1W' },
            { text: lst('本周'), value: 'C0W' },
            { text: lst('上周'), value: 'C-1W' },
            { text: lst('本月'), value: 'C0M' },
            { text: lst('下月'), value: 'C1M' },
            { text: lst('上月'), value: 'C-1M' },
            { text: lst('今年'), value: 'C0Y' },
            { text: lst('明年'), value: 'C1Y' },
            { text: lst('去年'), value: 'C-1Y' },
        ]
        async function mousedown(e: React.MouseEvent) {
            var ops = options.findAll(g => {
                if (g.type == MenuItemType.divide || lodash.isNull(g.value)) return true;
                else {
                    var m = self.props.mode.slice(0, 1).toUpperCase();
                    if (g.value.indexOf(m) > -1) return true
                    else return false;
                }
            }).map(c => {
                if (c.value)
                    return {
                        text: c.text,
                        value: c.value,
                        checkLabel: c.value == self.props.value
                    }
                else return c
            })
            var pos: PopoverPosition = { roundArea: Rect.fromEvent(e) }
            var rs = await useSelectMenuItem(pos, ops);
            if (rs) {
                if (lodash.isNull(rs.item.value)) {
                    var r = await useDatePicker(pos, typeof self.props.value == 'number' ? new Date(self.props.value) : undefined);
                    if (r) {
                        self.props.onChange(r.getTime());
                    }
                }
                else {
                    self.props.onChange(rs.item.value);
                }
            }
        }
        var format = this.props.format;
        if (!format) {
            if (this.props.mode == 'year') format = 'YYYY';
            else if (this.props.mode == 'month') format = 'YYYY/MM';
            else if (this.props.mode == 'day' || this.props.mode == 'week') format = 'YYYY/MM/DD';
            else if (this.props.mode == 'hour') format = 'YYYY/MM/DD HH';
        }
        var dateString = '';
        if (typeof this.props.value == 'number') {
            dateString = dayjs(this.props.value).format(format);
        }
        else if (typeof this.props.value == 'string') {
            var op = options.find(o => o.value == this.props.value);
            dateString = op ? op.text : lst('选择时间');
        }
        else dateString = lst('选择时间')
        return <div className={"shy-date-input " + this.props.size} onMouseDown={e => mousedown(e)} >
            <span className="cursor"> {dateString}</span>
        </div>
    }
}


export function getDateRange(date: string | number, mode: 'year' | 'month' | 'day' | 'hour' | 'week') {
    var start: Date;
    var end: Date;
    if (typeof date == 'number') {
        var d = new Date(date);
        var dd = dayjs(d);
        if (mode == 'year') {
            start = dd.startOf('year').toDate();
            end = dd.endOf('year').toDate();
        }
        else if (mode == 'month') {
            start = dd.startOf('month').toDate();
            end = dd.endOf('month').toDate();
        }
        else if (mode == 'day') {
            start = dd.startOf('day').toDate();
            end = dd.endOf('day').toDate();
        }
        else if (mode == 'hour') {
            start = dd.startOf('hour').toDate();
            end = dd.endOf('hour').toDate();
        }
        else if (mode == 'week') {
            start = dd.startOf('week').toDate();
            end = dd.endOf('week').toDate();
        }
    }
    else {
        var now = dayjs();
        if (/^[\d\-\.]+D$/.test(date)) {
            var n = parseFloat(date.replace('D', ''));
            if (n > 0) {
                start = now.startOf('day').toDate();
                end = now.add(n, 'day').endOf('day').toDate();
            }
            else {
                start = now.add(n, 'day').startOf('day').toDate();
                end = now.endOf('day').toDate();
            }
        }
        else if (/^[\d\-\.]+W$/.test(date)) {
            var n = parseFloat(date.replace('W', ''));
            if (n > 0) {
                start = now.startOf('day').toDate();
                end = now.add(n, 'week').endOf('day').toDate();
            }
            else {
                start = now.add(n, 'week').startOf('day').toDate();
                end = now.endOf('day').toDate();
            }
        }
        else if (/^[\d\-\.]+M$/.test(date)) {
            var n = parseFloat(date.replace('M', ''));
            if (n > 0) {
                start = now.startOf('day').toDate();
                end = now.add(n, 'month').endOf('day').toDate();
            }
            else {
                start = now.add(n, 'month').startOf('day').toDate();
                end = now.endOf('day').toDate();
            }
        }
        else if (/^[\d\-\.]+Y$/.test(date)) {
            var n = parseFloat(date.replace('Y', ''));
            if (n > 0) {
                start = now.startOf('day').toDate();
                end = now.add(n, 'year').endOf('day').toDate();
            }
            else {
                start = now.add(n, 'year').startOf('day').toDate();
                end = now.endOf('day').toDate();
            }
        }
        else if (/^[\d\-\.]+H$/.test(date)) {
            var n = parseFloat(date.replace('H', ''));
            if (n > 0) {
                start = now.startOf('hour').toDate();
                end = now.add(n, 'hour').endOf('hour').toDate();
            }
            else {
                start = now.add(n, 'hour').startOf('hour').toDate();
                end = now.endOf('hour').toDate();
            }
        }

        else if (/^C[\d\-\.]+D$/.test(date)) {
            var n = parseFloat(date.replace('D', '').replace('C', ''));
            start = now.add(n, 'day').startOf('day').toDate();
            end = now.add(n, 'day').endOf('day').toDate();
        }
        else if (/^C[\d\-\.]+W$/.test(date)) {
            var n = parseFloat(date.replace('W', '').replace('C', ''));
            start = now.add(n, 'week').startOf('week').toDate();
            end = now.add(n, 'week').endOf('week').toDate();
        }
        else if (/^C[\d\-\.]+M$/.test(date)) {
            var n = parseFloat(date.replace('M', '').replace('C', ''));
            start = now.add(n, 'month').startOf('month').toDate();
            end = now.add(n, 'month').endOf('month').toDate();
        }
        else if (/^C[\d\-\.]+Y$/.test(date)) {
            var n = parseFloat(date.replace('Y', '').replace('C', ''));
            start = now.add(n, 'year').startOf('year').toDate();
            end = now.add(n, 'year').endOf('year').toDate();
        }
        else if (/^C[\d\-\.]+H$/.test(date)) {
            var n = parseFloat(date.replace('H', '').replace('C', ''));
            start = now.add(n, 'hour').startOf('hour').toDate();
            end = now.add(n, 'hour').endOf('hour').toDate();
        }
    }
    return { start, end }
}


