import dayjs from "dayjs";
import React from "react";
import { lst } from "../../i18n/store";
import { Rect } from "../../src/common/vector/point";
import { useDatePicker } from ".";

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
        return <div onMouseDown={e => mousedown(e)} >
            <span className="cursor"> {this.props.value ? dayjs(this.props.value).format(format) : lst('选择时间')}</span>
        </div>
    }
}


