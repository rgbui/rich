import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { DataGridCard } from "../base";

@url('/data-grid/card/like')
export class CardLike extends DataGridCard {

}
@view('/data-grid/card/like')
export class CardLikeView extends BlockView<CardLike>{
    renderItems() {
        return <div className='sy-data-grid-item'><ChildsArea childs={this.block.childs}></ChildsArea> </div>
    }
}