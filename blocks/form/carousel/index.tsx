import React from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";

@url('/carousel')
export class Carousel extends Block {
    carouselIndex: number = 0;
}
@view('/carousel')
export class CarouselView extends BlockView<Carousel>{
    render() {
        return <div className='sy-block-carousel'
            style={this.block.visibleStyle}>
            <div className="sy-block-carousel-indicators">

            </div>
            <div className="sy-block-carousel-contents">
                <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
            </div>
        </div>
    }
}