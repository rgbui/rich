import React from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";

@url('/carousel/content')
export class CarouselContent extends Block {
    partName: string = 'carousel-content';
}
@view('/carousel/content')
export class CarouselContentView extends BlockView<CarouselContent>{
    render() {
        return <div className='sy-block-carousel-content'
            style={this.block.visibleStyle}>
            <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
        </div>
    }
}