import { BaseComponent } from "../base/component";
import { Content } from "../base/common/content";
import { observable, prop, url, view } from "../factory/observable";
import React from 'react';
import ReactDOM from 'react-dom';
import { BlockType } from "../base/enum";
@url('/image')
export class Image extends Content {
    @prop()
    src: string;
    isPerLine = true;
}
@view('/image')
export class ImageView extends BaseComponent<Image>{
    render() {
        var align = this.block.align || 'center';
        var style: Record<string, any> = {
            width: (this.block.widthPercent || 100) + "%"
        }
        var wrapperStyle: Record<string, any> = {};
        if (this.block.isPerLine == true) {
            wrapperStyle.alignItems = align;
            if (align == 'left') wrapperStyle.alignItems = 'flex-start'
            else if (align == 'right') wrapperStyle.alignItems = 'flex-end'
        }
        
        if (this.block.isPerLine == true)
            return <div className='block-image-wrapper' style={wrapperStyle}><div ref={e => this.block.setPart('default', e, BlockType.solid)} className='block-image' style={style}>
                {this.block.src && <img src={this.block.src} />}
            </div></div>
        else return <div className='block-image' ref={e => this.block.setPart('default', e, BlockType.solid)} style={style}>
            {this.block.src && <img src={this.block.src} />}
        </div>;
    }
}