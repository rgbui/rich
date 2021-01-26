import { Content } from "../base/content";
import React from 'react';
import { BaseComponent } from "../base/component";
export class TextSpan extends Content {
    display: 'inline-block' = 'inline-block';
    content: string;
    mouseIsInTextArea(event: MouseEvent) {
        if (this.childs.length > 0) return false;
        return true;
    }
}
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
            return <span className='block-text-span' style={style}>{this.block.content}</span>
    }
}