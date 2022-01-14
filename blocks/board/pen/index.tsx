import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import "./style.less";
// https://github.com/szimek/signature_pad
// https://www.cnblogs.com/fangsmile/p/13427794.html
@url('/pen')
export class Pen extends Block {
    isScale: boolean = true;
    @prop()
    pathString: string = '';
}
@view('/pen')
export class PenView extends BlockView<Pen>{
    render(): ReactNode {
        return <div className="sy-block-pen" style={this.block.visibleStyle}>
            <svg style={{ width: this.block.fixedWidth, height: this.block.fixedHeight }}>
                {this.block.pathString && <path d={this.block.pathString}></path>}
            </svg>
        </div>
    }
}