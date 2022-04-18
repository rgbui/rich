import React from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import "./style.less";
@url('/board')
export class Board extends Block {
    @prop()
    viewHeight: number = 300;
}
@view('/board')
export class BoardView extends BlockView<Board>{
    render() {
        var style = this.block.visibleStyle;
        style.height = this.block.viewHeight;
        return <div className="sy-board" style={style}>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}

