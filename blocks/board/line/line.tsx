import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BoardPointType } from "../../../src/block/partial/board";
import { BlockView } from "../../../src/block/view";
import { Point, PointArrow } from "../../../src/common/vector/point";
import { Polygon } from "../../../src/common/vector/polygon";
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
            point.x = pl.x as number;
            point.y = pl.y as number;
        }
        return point;
    }
}
@view('/line')
export class LineView extends BlockView<Line>{
    render(): ReactNode {
        var from = this.block.cacPortLocationPos(this.block.from);
        var to = this.block.cacPortLocationPos(this.block.to);
        if (!from || !to) return <></>;
        if (from.equal(to)) {
            to = from.move(20, 20);
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
                marginLeft: re.x,
                marginTop: re.y,
                strokeWidth
            }}>
                <path className="visible" d={`M${from.x} ${from.y},${to.x} ${to.y}`}></path>
                <path stroke="transparent" strokeWidth={strokeWidth} d={`M${from.x} ${from.y},${to.x} ${to.y}`}></path>
            </svg>
        </div>
    }
}