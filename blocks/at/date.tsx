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
import { DragHandleSvg, EditSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { ToolTip } from "../../component/view/tooltip";
import { BoxTip } from "../../component/view/tooltip/box";
import { DragBlockLine } from "../../src/kit/handle/line";

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
    async getMd() {
        return `@${dayjs(this.date).format('YYYY-MM-DD')}`;
    }
}
@view('/mention/date')
export class ShyDateView extends BlockView<ShyDate>{
    boxTip: BoxTip;
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    render() {
        return <span className='sy-block-date' onMouseDown={e => this.block.openDate(e)} >
            <BoxTip ref={e => this.boxTip = e} placement="bottom" overlay={<div className="flex-center">
                <ToolTip overlay={'拖动'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></a></ToolTip>
                <ToolTip overlay={'编辑'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.block.openDate(e)}><Icon size={16} icon={EditSvg}></Icon></a></ToolTip>
            </div>}>
                <SolidArea prop='date' block={this.block}>@{dayjs(this.block.date).format('YYYY-MM-DD')}</SolidArea>
            </BoxTip>
        </span>
    }
}


