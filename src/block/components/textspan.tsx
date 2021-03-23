import { Content } from "../base/common/content";
import React from 'react';
import { BaseComponent } from "../base/component";
import { BlockAppear, BlockDisplay } from "../base/enum";
import { url, view } from "../factory/observable";
@url("/textspan")
export class TextSpan extends Content {
    display = BlockDisplay.block;
    appear = BlockAppear.none;
    content: string;
    get isText() {
        if (this.childs.length > 0) return false;
        return true;
    }
    get isContent() {
        return false;
    }
    get isLayout() {
        if (this.childs.length > 0) return true;
        else return false;
    }
}
@view("/textspan")
export class TextSpanView extends BaseComponent<TextSpan>{
    render() {
        var style: Record<string, any> = {
            width: (this.block.widthPercent || 100) + "%"
        };
        if (this.block.childs.length > 0)
            return <span className='block-text-span' style={style}>{this.block.childs.map(x =>
                <x.viewComponent key={x.id} block={x}></x.viewComponent>
            )}</span>
        else
            return <span className='block-text-span' style={style}
                dangerouslySetInnerHTML={this.block.htmlContent}></span>
    }
}