
import { BlockView } from "../../../src/block/view";
import React from 'react';
import { url, view } from "../../../src/block/factory/observable";
import { BlockDisplay } from "../../../src/block/enum";
import { Block } from "../../../src/block";
import { ChildsArea } from "../../../src/block/view/appear";

@url('/flow/mind')
export class FlowMind extends Block {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get isContinuouslyCreated() {
        return true
    }
    get appearAnchors() {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
    display = BlockDisplay.block;
}
@view('/flow/mind')
export class FlowMindView extends BlockView<FlowMind>{
    renderNode() {
        return <></>;
    }

    render() {
        return <div className='sy-flow-mind' style={this.block.visibleStyle} >
            <div className='sy-flow-mind-text'>
                {this.renderNode()}
            </div>
            <div className='sy-flow-mind-subs'>
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>
        </div>
    }
}