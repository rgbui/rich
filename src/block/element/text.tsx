
import { BlockView } from "../view";
import React from 'react';
import { BlockDisplay } from "../enum";
import { prop, url, view } from "../factory/observable";
import { TextArea } from "../view/appear";
import { PageLink } from "../../../extensions/link/declare";
import Tooltip from "rc-tooltip";
import GlobalLink from "../../assert/svg/GlobalLink.svg";
import LinkTo from "../../assert/svg/LinkTo.svg";
import { Block } from "..";
/***
 * 文字型的block，
 * 注意该文字block里面含有子文字或其它的如图像block等
 */
@url('/text')
export class TextContent extends Block {
    display = BlockDisplay.inline;
    @prop()
    link: PageLink = null;
    @prop()
    comment: { id: string } = null;
    @prop()
    mention: { userid: string } = null;
    @prop()
    isCode: boolean = false;
    get isTextContent() {
        return true;
    }
}
@view('/text')
export class TextContentView extends BlockView<TextContent>{
    render() {
        var ta = <TextArea rf={e => this.block.elementAppear({ el: e })} html={this.block.htmlContent}></TextArea>
        if (this.block.link) {
            if (this.block.link.pageId) {
                ta = <a href={'/page/' + this.block.link.pageId}>{ta}</a>
            }
            else if (this.block.link.url) {
                ta = <a target='_blank' href={this.block.link.url}>{ta}</a>
            }
        }
        else if (this.block.isCode) {
            ta = <span className='sy-block-text-content-code'>{ta}</span>;
        }
        return <span className='sy-block-text-content' style={this.block.visibleStyle} >
            {ta}
        </span>
    }
}

