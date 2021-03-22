import { BaseBlock } from "../base";
import { BaseComponent } from "../base/component";
import { BlockComposition } from "../base/common/composition/block";
import React from 'react';



import { BlockDisplay, BlockType } from "../base/enum";
import { url, view } from "../factory/observable";
/***
 * 文字型的block，
 * 注意该文字block里面含有子文字或其它的如图像block等
 */
@url('/text')
export class TextContent extends BlockComposition {
    content: string;
    display = BlockDisplay.inline;
    type = BlockType.text;
}
@view('/text')
export class TextContentView extends BaseComponent<TextContent>{
    render() {
        return <span className='block-text-content' dangerouslySetInnerHTML={this.block.htmlContent}></span>
    }
}