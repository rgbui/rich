import { BaseBlock } from "../base/base";
import { BaseComponent } from "../base/component";
import { BlockComposition } from "../base/composition/block";
import React from 'react';
/***
 * 文字型的block，
 * 注意该文字block里面含有子文字或其它的如图像block等
 */
export class TextContent extends BlockComposition {
    content: string;
}

export class TextContentView extends BaseComponent<TextContent>{
    render() {
        return <span className='block-text-content' >{this.block.content}</span>
    }
}