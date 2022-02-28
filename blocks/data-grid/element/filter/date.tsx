import dayjs from "dayjs";
import React from "react";
import { useDatePicker } from "../../../../extensions/date";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { OriginFilterField } from "./origin.field";

@url('/field/filter/date')
export class FilterFieldDate extends OriginFilterField {
    startDate: Date;
    endDate: Date;
    async openDatePicker(key: string, event: React.MouseEvent) {
        event.stopPropagation();
        var el = event.target as HTMLElement;
        var pickDate = await useDatePicker({ roundArea: Rect.from(el.getBoundingClientRect()) }, this[key], {
            includeTime: this.field?.config?.includeTime ? true : false
        });
        if (typeof pickDate != 'undefined') {
            this[key] = pickDate;
            this.forceUpdate()
        }
    }
    get format() {
        var fr = 'YYYY-MM-DD';
        if (this.field?.config.includeTime) fr = 'YYYY-MM-DD HH:mm';
        return fr;
    }
}
@view('/field/filter/date')
export class FilterFieldDateView extends BlockView<FilterFieldDate>{
    render() {
        return <div className='sy-filter-date'>
            <div className="sy-filter-date-input">
                <span onMouseDown={e => this.block.openDatePicker('startDate', e)}>{this.block.startDate ? dayjs(this.block.startDate).format(this.block.format) : ""}</span>

                <span onMouseDown={e => this.block.openDatePicker('endDate', e)}>{this.block.endDate ? dayjs(this.block.endDate).format(this.block.format) : ""}</span>
            </div>
        </div>
    }
}