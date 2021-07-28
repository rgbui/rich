import React from "react";
/**
 * https://dayjs.gitee.io/docs/zh-CN/installation/installation
 * 
 */
import { Dayjs } from "dayjs";
type props = {
    defaultValue: Date,
    onChange(value: Date): void;
    picker: 'date' | 'week' | 'month' | 'quarter' | 'year',
    showToday: boolean
}
export class DateDrop extends React.Component<props>{
    private cn(...names: string[]) {
        return names.join(" ");
    }
    private renderMonth(): JSX.Element {
        var dj = new Dayjs(this.props.defaultValue);
        var month = dj.month() + 1;
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
        var weeks: string[] = [];
        return <div className={this.cn('date-drop-box')}>
            <div className={this.cn('date-drop-box-weeks')}>
                {weeks.map(we => {
                    return <a></a>
                })}
            </div>
            <div className={this.cn('date-drop-box-days')}>
                {days.map(day => {
                    return <a key={day.get('day')}>{day.get('day')}</a>
                })}
            </div>
        </div>
    }
    render() {
        return <div className={this.cn('date-drop')}>

        </div>
    }
}