import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Point } from "../../../src/common/vector/point";
import { Polygon } from "../../../src/common/vector/polygon";
import "./style.less";
// https://github.com/szimek/signature_pad
// https://www.cnblogs.com/fangsmile/p/13427794.html
@url('/pen')
export class Pen extends Block {
    @prop()
    points: Point[] = [];
    isScale: boolean = true;
}
@view('/pen')
export class PenView extends BlockView<Pen>{
    render(): ReactNode {
        var poly = new Polygon(...this.block.points);
        var bound = poly.bound;
        var relativePoly = poly.relative(poly.bound.leftTop);
        return <div className="sy-block-pen" style={this.block.visibleStyle}>
            <svg viewBox={`0 0 ${bound.width} ${bound.height}`}>
                <path d={relativePoly.pathString(false)}></path>
            </svg>
        </div>
    }
}