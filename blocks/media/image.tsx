import { BlockView } from "../../src/block/component";
import {  prop, url, view } from "../../src/block/factory/observable";
import React from 'react';
import { BlockAppear } from "../../src/block/base/enum";
import { SolidArea } from "../../src/block/base/appear";
import { Content } from "../../src/block/layout/content";
@url('/image')
export class Image extends Content {
    @prop()
    src: string;
    appear = BlockAppear.solid;
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