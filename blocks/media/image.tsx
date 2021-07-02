import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React from 'react';
import { BlockAppear } from "../../src/block/partial/enum";
import { SolidArea } from "../../src/block/partial/appear";
import { Content } from "../../src/block/element/content";
import { Rect } from "../../src/common/point";
@url('/image')
export class Image extends Content {
    @prop()
    src: string;
    appear = BlockAppear.solid;
    getVisibleContentBound() {
        var img = this.el.querySelector('.sy-block-image-content img');
        return Rect.from(img.getBoundingClientRect())
    }
}
@view('/image')
export class ImageView extends BlockView<Image>{
    render() {
        var align = this.block.align || 'center';
        var contentStyle: Record<string, any> = {
            width: (this.block.widthPercent || 100) + "%"
        }
        var style: Record<string, any> = {};
        style.alignItems = align;
        if (align == 'left') style.alignItems = 'flex-start'
        else if (align == 'right') style.alignItems = 'flex-end'
        return <div className='sy-block-image' style={style}>
            <div className='sy-block-image-content' style={contentStyle}>
                <SolidArea content={
                    this.block.src && <img src={this.block.src} />
                }></SolidArea>
            </div>
        </div>
    }
}