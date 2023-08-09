import React from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { GridMap } from "../../../src/page/grid";
import "./style.less";

@url('/board/card')
export class PageCard extends Block {
    init() {
        this.gridMap = new GridMap(this)
    }
}

@view('/board/card')
export class PageCardView extends BlockView<PageCard>{
    renderView() {
        return <div style={this.block.visibleStyle}>
            <div className='sy-block-card' >
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
        </div>
    }
}