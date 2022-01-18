import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BoardPointType } from "../../../src/block/partial/board";
import { BlockView } from "../../../src/block/view";
import { Point, PointArrow } from "../../../src/common/vector/point";
import { Polygon } from "../../../src/common/vector/polygon";
import { util } from "../../../util/util";
import "./style.less";
export type PortLocation = {
    x: number | PointArrow,
    y: number | PointArrow,
    blockId?: string
}
@url('/line')
export class Line extends Block {
    getBlockBoardSelector(types: BoardPointType[] = [
        BoardPointType.path,
        BoardPointType.resizePort,
        BoardPointType.connectPort
    ]) {
        var pickers: { type: BoardPointType, arrows: PointArrow[], point?: Point, poly?: Polygon }[] = [];
        var gm = this.globalWindowMatrix;
        var fp = this.cacPortLocationPos(this.from);
        if (fp) pickers.push({
            type: BoardPointType.movePort,
            arrows: [PointArrow.from],
            point: gm.transform(fp)
        });
        var to = this.cacPortLocationPos(this.to);
        if (to) pickers.push({
            type: BoardPointType.movePort,
            arrows: [PointArrow.to],
            point: gm.transform(to)
        });
        return pickers;
    }
    @prop()
    from: PortLocation = { x: 0, y: 0 };
    @prop()
    to: PortLocation = { x: 100, y: 100 };
    cacPortLocationPos(pl: PortLocation): Point {
        var point = new Point();
        if (pl.blockId) {
            var block = this.page.find(g => g.id == pl.blockId);
            if (block) {
                var pickers = block.getBlockBoardSelector([BoardPointType.pathConnectPort]);
                var ps = typeof pl.x == 'string' && typeof pl.y == 'string' ? pickers.findAll(x => x.type == BoardPointType.pathConnectPort) : pickers.findAll(x => x.type == BoardPointType.path);
                if (typeof pl.x == 'string' && typeof pl.y == 'string') {
                    var pi = ps.find(g => g.arrows.every(s => [pl.x, pl.y].includes(s)));
                    return this.globalWindowMatrix.inverseTransform(pi.point)
                }
                else {

                }
            }
        }
        else {
            //var po=this.globalWindowMatrix.transform(pl  as Point);
            point.x = pl.x as number;
            point.y = pl.y as number;
        }
        return point;
    }
    async updateLine(from: PortLocation, to: PortLocation, oldData?: {
        from: PortLocation;
        to: PortLocation;
    }) {
        oldData = oldData || { from: util.clone(this.from), to: util.clone(this.to) };
        if (oldData.from.blockId !== from.blockId) {
            if (oldData.from.blockId) {
                var fb = this.page.find(g => g.id == oldData.from.blockId);
                if (fb) {
                    fb.disconnectLine(this);
                }
            }
            if (from.blockId) {
                var fb = this.page.find(g => g.id == from.blockId);
                if (fb) {
                    fb.conectLine(this);
                }
            }
        }
        if (oldData.to.blockId !== to.blockId) {
            if (oldData.to.blockId) {
                var fb = this.page.find(g => g.id == oldData.to.blockId);
                if (fb) {
                    fb.disconnectLine(this);
                }
            }
            if (to.blockId) {
                var fb = this.page.find(g => g.id == to.blockId);
                if (fb) {
                    fb.conectLine(this);
                }
            }
        }
        this.manualUpdateProps(oldData, { from, to });
    }
    async getBoardEditCommand(this: Block): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'lineInsertSharp' });
        cs.push({ name: 'lineArrow' });
        cs.push({ name: 'lineType' });
        cs.push({ name: 'backgroundColor' });
        return cs;
    }
    getVisiblePolygon() {
        var from = this.cacPortLocationPos(this.from);
        var to = this.cacPortLocationPos(this.to);
        var gm = this.globalWindowMatrix;
        var poly = new Polygon(gm.transform(from), gm.transform(to));
        return poly;
    }
}
@view('/line')
export class LineView extends BlockView<Line>{
    render(): ReactNode {
        var from = this.block.cacPortLocationPos(this.block.from);
        var to = this.block.cacPortLocationPos(this.block.to);
        if (!from || !to) return <></>;
        if (from.equal(to)) {
            //to = from.move(20, 20);
        }
        var poly = new Polygon(from, to);
        var rect = poly.bound;
        var re = rect.extend(30);
        var feelLineDistance = 10;
        var s = this.block.globalWindowMatrix.getScaling().x;
        var strokeWidth = feelLineDistance / s;
        return <div className="sy-block-line" style={this.block.visibleStyle}>
            <svg viewBox={`${re.x} ${re.y} ${re.width} ${re.height}`} style={{
                width: re.width,
                height: re.height,
                transform: `translate(${re.x}px,${re.y}px)`,
                // marginLeft: re.x,
                // marginTop: re.y
            }}>
                <path className="visible" d={`M${from.x} ${from.y},${to.x} ${to.y}`}></path>
                <path stroke="transparent" strokeWidth={strokeWidth} d={`M${from.x} ${from.y},${to.x} ${to.y}`}></path>
            </svg>
        </div>
    }
}