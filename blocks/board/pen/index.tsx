import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
// https://github.com/szimek/signature_pad

@url('/pen')
export class Pen extends Block {

}
@view('/pen')
export class PenView extends BlockView<Pen>{
    render(): ReactNode {
        return <div className="sy-block-pen" style={this.block.visibleStyle}>
        </div>
    }
}