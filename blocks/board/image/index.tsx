import React from "react";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { Block } from "../../../src/block";
import { url, prop, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";


@url('/board/image')
export class Image extends Block {
    @prop()
    src: ResourceArguments;
    @prop()
    originSize: { width: number, height: number } = { width: 100, height: 100 }
    get fixedSize() {
        var w = this.fixedWidth / this.originSize.width;
        var h = this.fixedHeight / this.originSize.height;
        var r = Math.max(w, h);
        var width = this.originSize.width * r;
        var height = this.originSize.height * r;
        return { width, height };
    }
    getVisibleBound(): Rect {
        var fs = this.fixedSize;
        var rect = new Rect(0, 0, fs.width, fs.height);
        rect = rect.transformToRect(this.globalWindowMatrix);
        return rect;
    }
    getVisibleContentBound() {
        return this.getVisibleBound()
    }
}
@view('/board/image')
export class ImageView extends BlockView<Image>{
    renderView() {
        var style = this.block.visibleStyle;
        var size = this.block.fixedSize;
        style.width = size.width;
        style.height = size.height;
        return <div className='sy-block-image' style={style} >
            <img src={this.block?.src?.url} className='w100 h100' />
        </div>
    }
}