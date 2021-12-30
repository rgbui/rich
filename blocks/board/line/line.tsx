import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
@url('/line')
export class Line extends Block {

}
@view('/line')
export class LineView extends BlockView<Line>{
    render(): ReactNode {
        return <div className="sy-block-line" style={this.block.visibleStyle}>
        </div>
    }
}