import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Point } from "../../../src/common/point";
import "./style.less";
export type PortLocation = {
    x: number | 'left' | 'right' | 'center',
    y: number | 'top' | 'bottom' | "middle",
    blockId?: string
}
@url('/line')
export class Line extends Block {
    @prop()
    from: PortLocation = { x: 0, y: 0 };
    @prop()
    to: PortLocation = { x: 100, y: 100 };
    cacPortLocationPos(pl: PortLocation): Point {
        var point = new Point();
        if (pl.blockId) {
            var block = this.page.find(g => g.id == pl.blockId);
            var bound = block.getVisibleContentBound();
            var np = this.page.getRelativePoint(bound.leftTop);
            var ng = this.globalMatrix;
            np = Point.from(ng.inverseTransform(np))
            bound.moveTo(np);
            if (pl.x == 'left') point.x = bound.x;
            else if (pl.x == 'center') point.x = bound.x + bound.width / 2;
            else if (pl.x == 'right') { point.x = bound.x + bound.width; }
            else { point.x = bound.x + pl.x; }
            if (pl.y == 'top') point.y = bound.y;
            else if (pl.y == 'middle') point.y = bound.y + bound.height / 2;
            else if (pl.y == 'bottom') point.y = bound.y + bound.height;
            else point.y = bound.y + pl.y;
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
        var dx = to.x - from.x;
        var dy = to.y - from.y;
        return <div className="sy-block-line" style={this.block.visibleStyle}>
            <svg style={{
                width: Math.abs(from.x - to.x),
                height: Math.abs(from.y - to.y)
            }}><path d={`M0 0,${dx} ${dy}`}></path>
            </svg>
        </div>
    }
}