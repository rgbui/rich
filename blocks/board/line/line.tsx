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
    getBlockPicker() {
        var pickers: { type: BoardPointType, arrows: PointArrow[], point?: Point, poly?: Polygon }[] = [];
        var gm = this.globalWindowMatrix;
        pickers.push({
            type: BoardPointType.movePort,
            arrows: [PointArrow.from],
            point: gm.transform(this.cacPortLocationPos(this.from))
        });
        pickers.push({
            type: BoardPointType.movePort,
            arrows: [PointArrow.to],
            point: gm.transform(this.cacPortLocationPos(this.to))
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
            var pickers = block.getBlockPicker();
            var ps = typeof pl.x == 'string' && typeof pl.y == 'string' ? pickers.findAll(x => x.type == BoardPointType.connectPort) : pickers.findAll(x => x.type == BoardPointType.path);
            if (typeof pl.x == 'string' && typeof pl.y == 'string') {
                var pi = ps.find(g => g.arrows.every(s => [pl.x, pl.y].includes(s)));
                return this.globalWindowMatrix.inverseTransform(pi.point)
            }
            else {

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
        if (from.equal(to)) {
            to = from.move(20, 20);
        }
        var poly = new Polygon(from, to);
        var rect = poly.bound;
        var re = rect.extend(30);
        return <div className="sy-block-line" style={this.block.visibleStyle}>
            <svg viewBox={`${re.x} ${re.y} ${re.width} ${re.height}`} style={{
                width: re.width,
                height: re.height,
                marginLeft: re.x,
                marginTop: re.y
            }}><path d={`M${from.x} ${from.y},${to.x} ${to.y}`}></path>
            </svg>
        </div>
    }
}