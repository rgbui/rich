import React from "react";
import { Block } from "../../src/block";
import { SolidArea } from "../../src/block/view/appear";
import { BlockDisplay } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import dayjs from "dayjs";
import { useDatePicker } from "../../extensions/date";
import { Rect } from "../../src/common/vector/point";
import "./style.less";

@url('/mention/date')
export class ShyDate extends Block {
    @prop()
    date: number;
    @prop()
    endDate: boolean = false;
    @prop()
    includeTime: boolean = false;
    @prop()
    dateFormate: string;
    @prop()
    timeFormate: string;
    @prop()
    remind: number;
    display = BlockDisplay.inline;
    async openDate(event: React.MouseEvent) {
        var r = await useDatePicker({ roundArea: Rect.fromEvent(event) },
            new Date(this.date || Date.now()),
            { includeTime: this.includeTime });
        if (r) {
            this.onUpdateProps({ date: r.getTime() })
        }
    }
    async getHtml() {
        return `<time datetime="${dayjs(this.date).format('YYYY-MM-DD')}">@${dayjs(this.date).format('YYYY-MM-DD')}</time>`
    }
}
@view('/mention/date')
export class ShyDateView extends BlockView<ShyDate>{
    render() {
        return <div className='sy-block-date' onMouseDown={e => this.block.openDate(e)} >
            <SolidArea prop='date' block={this.block}>@{dayjs(this.block.date).format('YYYY-MM-DD')}</SolidArea>
        </div>
    }
}