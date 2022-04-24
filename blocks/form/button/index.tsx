import React from "react";
import { Block } from "../../../src/block";
import { BlockAppear } from "../../../src/block/appear";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { TextArea } from "../../../src/block/view/appear";
import { ActionFlowType, ActionScope, ExcuteAction, ExcuteScope } from "./declare";

@url('/button')
export class BlockButton extends Block {
    @prop()
    showIcon: boolean = true;
    @prop()
    showText: boolean = true;
    @prop()
    actions: ActionFlowType[] = [];
    @prop()
    actionScope: ActionScope = { type: ExcuteScope.none };
    async mousedown(event: MouseEvent) {
        await ExcuteAction({
            block: this,
            scope: { $event: event },
            actions: this.actions,
            actionScope: this.actionScope
        });
    }
}
@view('/button')
export class BlockButtonView extends BlockView<BlockButton>{
    render() {
        return <div className='sy-button' onMouseDown={e => this.block.mousedown(e.nativeEvent)} style={this.block.visibleStyle} ><TextArea block={this.block} placeholder='按钮'
            prop='content' ></TextArea>
        </div>
    }
}


