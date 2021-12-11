
import { BlockView } from "../../../src/block/view";
import React from 'react';
import { url, view } from "../../../src/block/factory/observable";
import { BlockDisplay } from "../../../src/block/enum";
import { Block } from "../../../src/block";
import { ChildsArea } from "../../../src/block/view/appear";
import { Rect } from "../../../src/common/point";
import { FlowMindLine } from "./line";
import './style.less';
@url('/flow/mind')
export class FlowMind extends Block {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get allBlockKeys(): string[] {
        return ['childs', 'subChilds'];
    }
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
    didMount() {
        this.updateFlowLine();
    }
    updateFlowLine() {
        if (this.flowMindLine && this.block.blocks.subChilds.length > 0) {
            var origin = Rect.fromEle(this.block.el).rightMiddle;
            var points = this.block.blocks.subChilds.map(sub => {
                return Rect.fromEle(sub.el.parentNode as HTMLElement).leftMiddle;
            });
            this.flowMindLine.updateView(origin, points);
        }
    }
    renderItems() {
        return <div className='sy-flow-mind-items'>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
    renderSubChilds() {
        return <div className='sy-flow-mind-sub-items'>
            {this.block.blocks.subChilds.map(child => {
                return <div className='sy-flow-mind-sub-item' key={child.id}><child.viewComponent></child.viewComponent></div>
            })}
        </div>
    }
    flowMindLine: FlowMindLine;
    render() {
        return <div className='sy-flow-mind' style={this.block.visibleStyle} >
            {this.renderItems()}
            {this.renderSubChilds()}
            <FlowMindLine ref={e => this.flowMindLine = e}></FlowMindLine>
        </div>
    }
}