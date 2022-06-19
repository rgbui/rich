import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import { SolidArea } from "../../src/block/view/appear";
import { BlockDisplay } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";

@url('/date')
export class ShyDate extends Block {
    @prop()
    src: ResourceArguments = { name: 'none' };
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

    }
}
@view('/date')
export class ShyDateView extends BlockView<ShyDate>{
    render() {
        return <div className='sy-block-date' onMouseDown={e => this.block.openDate(e)} >
            <SolidArea prop='date' block={this.block}></SolidArea>
        </div>
    }
}