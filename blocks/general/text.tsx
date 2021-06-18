
import { BaseComponent } from "../../src/block/component";
import { BlockComposition } from "../../src/block/layout/composition/block";
import React from 'react';
import { BlockAppear, BlockDisplay } from "../../src/block/base/enum";
import { url, view } from "../../src/block/factory/observable";
import { TextArea } from "../../src/block/base/appear";
/***
 * 文字型的block，
 * 注意该文字block里面含有子文字或其它的如图像block等
 */
@url('/text')
export class TextContent extends BlockComposition {
    content: string;
    display = BlockDisplay.inline;
    appear = BlockAppear.text;
    get isTextContent(){
        return true;
    }
}
@view('/text')
export class TextContentView extends BaseComponent<TextContent>{
    render() {
        return <span className='sy-block-text-content'  style={this.block.visibleStyle} >
            <TextArea html={this.block.htmlContent}></TextArea>
        </span>
    }
}

