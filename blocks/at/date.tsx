import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Content } from "../../src/block/element/content";
import { BlockAppear } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";

@url('/date')
export class ShyDate extends Content {
    @prop()
    src: ResourceArguments = { name: 'none' };
    @prop()
    date: number;
    appear = BlockAppear.solid;
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
    async openDate(event: React.MouseEvent) {

    }
}
@view('/date')
export class ShyDateView extends BlockView<ShyDate>{
    render() {
        return <div className='sy-block-date' onMouseDown={e => this.block.openDate(e)} >

        </div>
    }
}