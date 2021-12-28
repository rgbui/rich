import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
@url('/shape')
export class Shape extends Block {

}
@view('/shape')
export class ShapeView extends BlockView<Shape>{
    render(): ReactNode {
        return <div className="sy-block-shape" style={this.block.visibleStyle}>
           
        </div>
    }
}