
import { BlockView } from "../../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { ChildsArea, TextSpanArea } from "../../../src/block/view/appear";
import { Point, PointArrow, Rect, RectUtility } from "../../../src/common/vector/point";
import { FlowMindLine } from "./line";
import './style.less';
import { BoardPointType, BoardBlockSelector } from "../../../src/block/partial/board";
import { Polygon } from "../../../src/common/vector/polygon";
import { ActionDirective } from "../../../src/history/declare";
import { Matrix } from "../../../src/common/matrix";


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
    blocks: { childs: Block[], subChilds: Block[], otherChilds: Block[] } = { childs: [], subChilds: [], otherChilds: [] };
    get isMindRoot() {
        if (this.parent instanceof FlowMind) return false;
        else return true
    }
    get allBlockKeys(): string[] {
        return ['childs', 'subChilds', 'otherChilds'];
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
            var type = BoardPointType.mindAdd;
            if (this.mindDirection != 'none') {
                if (this.mindDirection == 'x' && (i == 1 || i == 3)) type = BoardPointType.connectPort;
                else if (this.mindDirection == 'y' && (i == 0 || i == 2)) type = BoardPointType.connectPort;
            }
            var arrows: PointArrow[] = [];
            if (i == 0) arrows = [PointArrow.top, PointArrow.center];
            else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
            else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
            else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
            return {
                type,
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
                var keys = 'subChilds';
                var matrix = new Matrix();
                var size = this.fixedSize;
                var d = 100;
                if (selector.arrows.every(g => [PointArrow.top, PointArrow.center].includes(g))) {
                    await this.updateProps({ direction: 'y' });
                    keys = 'subChilds';
                    if (this.blocks.subChilds.length > 0) {
                        var rect = RectUtility.getPointsBound(this.blocks.subChilds.map(s => (s as FlowMind).relativeFixedRect.rightBottom));
                        matrix.translate(rect.rightBottom.x + 30, Math.min(rect.rightBottom.y, 100))
                    }
                    else matrix.translate(size.width / 2, 0 - d)
                }
                else if (selector.arrows.every(g => [PointArrow.bottom, PointArrow.center].includes(g))) {
                    await this.updateProps({ direction: 'y' });
                    keys = 'otherChilds';
                    if (this.blocks.otherChilds.length > 0) {
                        var rect = RectUtility.getPointsBound(this.blocks.otherChilds.map(s => (s as FlowMind).relativeFixedRect.rightTop));
                        matrix.translate(rect.rightTop.x + 30, Math.min(rect.rightTop.y, 100))
                    }
                    else matrix.translate(size.width / 2, size.height + d)
                }
                else if (selector.arrows.every(g => [PointArrow.middle, PointArrow.right].includes(g))) {
                    await this.updateProps({ direction: 'x' });
                    keys = 'otherChilds';
                    if (this.blocks.otherChilds.length > 0) {
                        var rect = RectUtility.getPointsBound(this.blocks.otherChilds.map(s => (s as FlowMind).relativeFixedRect.leftBottom));
                        matrix.translate(Math.min(rect.rightBottom.x, 100), rect.leftBottom.y + 30)
                    }
                    else matrix.translate(size.width + d, size.height / 2)
                }
                else if (selector.arrows.every(g => [PointArrow.middle, PointArrow.left].includes(g))) {
                    await this.updateProps({ direction: 'x' });
                    keys = 'subChilds';
                    if (this.blocks.subChilds.length > 0) {
                        var rect = RectUtility.getPointsBound(this.blocks.subChilds.map(s => (s as FlowMind).relativeFixedRect.leftBottom));
                        matrix.translate(Math.min(rect.rightBottom.x, -100), rect.leftBottom.y + 30)
                    }
                    else matrix.translate(0 - d, size.height / 2)
                }
                var newBlock = await self.page.createBlock('/flow/mind',
                    { matrix: matrix.getValues() },
                    this,
                    undefined,
                    keys
                );
                newBlock.mounted(() => {
                    (self.view as any).updateFlowLine();
                    self.page.kit.picker.onPicker([newBlock]);
                })
            })
        }
    }
    updateRenderLines(isSelfUpdate?: boolean): void {
        super.updateRenderLines(isSelfUpdate);
        if (this.parent instanceof FlowMind) {
            (this.parent.view as any).updateFlowLine();
        }
        (this.view as any).updateFlowLine();
    }
    get relativeFixedRect() {
        var s = this.fixedSize;
        var point = new Point(0, 0);
        point = this.matrix.appended(this.moveMatrix).transform(point);
        var subRect = new Rect(point.x, point.y, s.width, s.height);
        return subRect;
    }
    cacFlowMindLayout() {

    }
}
@view('/flow/mind')
export class FlowMindView extends BlockView<FlowMind>{
    didMount() {
        this.updateFlowLine();
    }
    updateFlowLine() {
        if (this.flowMindLine && (this.block.blocks.subChilds.length > 0 || this.block.blocks.otherChilds.length > 0)) {
            var { width, height } = this.block.fixedSize;
            var rect = new Rect(0, 0, width, height);
            var leftOrigin = this.block.direction != 'y' ? rect.leftMiddle : rect.topCenter;
            var leftPoints = this.block.blocks.subChilds.map((sub: FlowMind) => {
                var s = sub.fixedSize;
                var subRect = new Rect(0, 0, s.width, s.height);
                return sub.matrix.appended(sub.moveMatrix).transform(this.block.direction != 'y' ? subRect.rightMiddle : subRect.bottomCenter);
            });

            var rightOrigin = this.block.direction != 'y' ? rect.rightMiddle : rect.bottomCenter;
            var rightPoints = this.block.blocks.otherChilds.map((sub: FlowMind) => {
                var s = sub.fixedSize;
                var subRect = new Rect(0, 0, s.width, s.height);
                return sub.matrix.appended(sub.moveMatrix).transform(this.block.direction != 'y' ? subRect.leftMiddle : subRect.topCenter);
            });

            this.flowMindLine.updateView(
                leftOrigin,
                leftPoints,
                rightOrigin,
                rightPoints,
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
        return <>
            <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            <ChildsArea childs={this.block.blocks.otherChilds}></ChildsArea>
        </>
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