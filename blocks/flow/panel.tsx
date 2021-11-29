
import { BlockView } from "../../src/block/view";
import React from 'react';
import { url, view } from "../../src/block/factory/observable";
import { BlockDisplay } from "../../src/block/enum";
import { Block } from "../../src/block";
import { ChildsArea } from "../../src/block/view/appear";

@url('/flow/panel')
export class FlowPanel extends Block {
    get isContinuouslyCreated() {
        return true
    }
    get appearAnchors() {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
    display = BlockDisplay.block;
}
@view('/flow/panel')
export class FlowPanelView extends BlockView<FlowPanel>{
    render() {
        return <div className='sy-flow-mind' style={this.block.visibleStyle}>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}