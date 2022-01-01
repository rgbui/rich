import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Point } from "../../../src/common/point";
import "./style.less";
@url('/line')
export class Line extends Block {
    @prop()
    from: Partial<Point> = { x: 0, y: 0 };
    @prop()
    to: Partial<Point> = { x: 100, y: 100 };
}
@view('/line')
export class LineView extends BlockView<Line>{
    render(): ReactNode {
        var dx = this.block.to.x - this.block.from.x;
        var dy = this.block.to.y - this.block.from.y;
        return <div className="sy-block-line" style={this.block.visibleStyle}>
            <svg style={{
                width: Math.abs(this.block.from.x - this.block.to.x),
                height: Math.abs(this.block.from.y - this.block.to.y)
            }}>
                <path d={`M0 0,${dx} ${dy}`}></path>
            </svg>
        </div>
    }
}