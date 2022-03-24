
import { BlockView } from "../../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockDisplay } from "../../../src/block/enum";
import { Block } from "../../../src/block";
import { ChildsArea, TextSpanArea } from "../../../src/block/view/appear";
import { PointArrow, Rect, RectUtility } from "../../../src/common/vector/point";
import { FlowMindLine } from "./line";
import './style.less';
import { BoardPointType, BoardBlockSelector } from "../../../src/block/partial/board";
import { Polygon } from "../../../src/common/vector/polygon";
import { ActionDirective } from "../../../src/history/declare";
import { BlockUrlConstant } from "../../../src/block/constant";

@url('/flow/mind')
export class FlowMind extends Block {
    @prop()
    direction: 'none' | 'x' | 'y' = 'none';
    get mindDirection() {
        return this.mindRoot.direction;
    }
    get mindRoot() {
        return this.closest(x => (x as FlowMind).isMindRoot) as FlowMind;
    }
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get isMindRoot() {
        if (this.parent instanceof FlowMind) return false;
        else return true
    }
    get allBlockKeys(): string[] {
        return ['childs', 'subChilds'];
    }
    get fixedSize(): { width: number; height: number; } {
        if (this.mindEl) {
            return {
                width: this.mindEl.offsetWidth,
                height: this.mindEl.offsetHeight
            }
        }
        else {
            return {
                width: this.fixedWidth,
                height: this.fixedHeight
            }
        }
    }
    getBlockBoardSelector(types?: BoardPointType[]): BoardBlockSelector[] {
        var pickers: BoardBlockSelector[] = [];
        var gm = this.globalWindowMatrix;
        var { width, height } = this.fixedSize;
        var rect = new Rect(0, 0, width, height);
        var s = gm.getScaling().x;
        var extendRect = rect.extend(20 / s);
        var pathRects = RectUtility.getRectLineRects(rect, 1 / s);
        pickers.push(...pathRects.map((pr, i) => {
            var arrows: PointArrow[] = [];
            if (i == 0) arrows = [PointArrow.top, PointArrow.center];
            else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
            else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
            else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
            return {
                type: BoardPointType.path,
                arrows,
                poly: new Polygon(...pr.points.map(p => gm.transform(p)))
            }
        }))
        pickers.push(...extendRect.centerPoints.toArray((p, i) => {
            if (this.mindDirection != 'none') {
                if (this.mindDirection == 'x' && (i == 0 || i == 2)) return;
                else if (this.mindDirection == 'y' && (i == 1 || i == 3)) return;
            }
            var arrows: PointArrow[] = [];
            if (i == 0) arrows = [PointArrow.top, PointArrow.center];
            else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
            else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
            else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
            return {
                type: BoardPointType.mindAdd,
                arrows,
                point: gm.transform(p)
            }
        }))
        return pickers;
    }
    get mindEl() {
        return (this.view as any).mindEl;
    }
    async onPickerMousedown(selector: BoardBlockSelector, event: React.MouseEvent) {
        var self = this;
        if (selector.type == BoardPointType.mindAdd) {
            this.onAction(ActionDirective.onMindAddSub, async () => {
                var newBlock = await self.page.createBlock('/flow/mind',
                    { blocks: { childs: [{ content: '', url: BlockUrlConstant.TextSpan }] } },
                    this,
                    undefined,
                    'subChilds'
                );
                if (selector.arrows.every(g => [PointArrow.top, PointArrow.center].includes(g))) {
                    await this.updateProps({ direction: 'y' });
                }
                else if (selector.arrows.every(g => [PointArrow.bottom, PointArrow.center].includes(g))) {
                    await this.updateProps({ direction: 'y' });
                }
                else if (selector.arrows.every(g => [PointArrow.middle, PointArrow.right].includes(g))) {
                    await this.updateProps({ direction: 'x' });
                }
                else if (selector.arrows.every(g => [PointArrow.middle, PointArrow.left].includes(g))) {
                    await this.updateProps({ direction: 'x' });
                }
            })
        }
    }
}
@view('/flow/mind')
export class FlowMindView extends BlockView<FlowMind>{
    didMount() {
        this.updateFlowLine();
    }
    updateFlowLine() {
        if (this.flowMindLine && this.block.blocks.subChilds.length > 0) {
            var gm = this.block.page.windowMatrix;
            var origin = Rect.fromEle(this.block.mindEl).rightMiddle;
            var points = this.block.blocks.subChilds.map((sub: FlowMind) => {
                if (sub.mindEl) return Rect.fromEle(sub.mindEl).leftMiddle;
            });
            this.flowMindLine.updateView(
                gm.transform(origin),
                points.map(p => gm.transform(p))
            );
        }
    }
    renderItems() {
        return <div className='sy-flow-mind-text' ref={e => this.mindEl = e} >
            <TextSpanArea block={this.block}></TextSpanArea>
        </div>
    }
    mindEl: HTMLElement;
    renderSubChilds() {
        return <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
    }
    flowMindLine: FlowMindLine;
    render() {
        return <div className='sy-flow-mind' style={this.block.visibleStyle}>
            {this.renderItems()}
            {this.renderSubChilds()}
            <FlowMindLine ref={e => this.flowMindLine = e}></FlowMindLine>
        </div>
    }
}