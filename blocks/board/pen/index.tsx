import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Point } from "../../../src/common/vector/point";
import { Polygon } from "../../../src/common/vector/polygon";

// https://github.com/szimek/signature_pad
// https://www.cnblogs.com/fangsmile/p/13427794.html
@url('/pen')
export class Pen extends Block {
    @prop()
    points: Point[] = [];
}
@view('/pen')
export class PenView extends BlockView<Pen>{
    render(): ReactNode {
        return <div className="sy-block-pen" style={this.block.visibleStyle}>
            <svg>
                <path d={(new Polygon(...this.block.points)).pathString(false)}></path>
            </svg>
        </div>
    }
}