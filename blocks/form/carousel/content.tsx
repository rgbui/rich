import React from "react";
import { Carousel } from ".";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";

@url('/carousel/content')
export class CarouselContent extends Block {
    partName: string = 'carousel-content';
    get handleBlock(): Block {
        return this.parent
    }
    get myCarousel() {
        return this.parent as Carousel
    }
    get visibleStyle() {
        var style = super.visibleStyle;
        if (this.at != this.myCarousel.carouselIndex) {
            style.display = 'none';
        }
        return style;
    }
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