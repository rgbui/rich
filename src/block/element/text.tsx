
import { BlockView } from "../view";
import { BlockComposition } from "./composition/block";
import React from 'react';
import { BlockAppear, BlockDisplay, BlockLink } from "../enum";
import { prop, url, view } from "../factory/observable";
import { TextArea } from "../partial/appear";
/***
 * 文字型的block，
 * 注意该文字block里面含有子文字或其它的如图像block等
 */
@url('/text')
export class TextContent extends BlockComposition {
    display = BlockDisplay.inline;
    appear = BlockAppear.text;
    @prop()
    link: BlockLink = null;
    @prop()
    comment: { id: string } = null;
    @prop()
    mention: { userid: string } = null;
    @prop()
    isInlineCode: boolean = false;
    get isTextContent() {
        return true;
    }
}
@view('/text')
export class TextContentView extends BlockView<TextContent>{
    render() {
        return <span className='sy-block-text-content' style={this.block.visibleStyle} >
            <TextArea html={this.block.htmlContent}></TextArea>
        </span>
    }
}

