
import { BlockView } from "../view";
import React from 'react';
import { BlockDisplay } from "../enum";
import { prop, url, view } from "../factory/observable";
import { TextArea } from "../view/appear";
import { PageLink } from "../../../extensions/link/declare";
import { Block } from "..";
import { channel } from "../../../net/channel";

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
    code: boolean = false;
    get isTextContent() {
        return true;
    }
    /**
     * text块中有一些属性
     * 可能需要传递的
     */
    get textContentAttributes() {
        return {
            link: this.link,
            comment: this.comment,
            mention: this.mention,
            code: this.code
        }
    }
}
@view('/text')
export class TextContentView extends BlockView<TextContent>{
    openPage(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        channel.air('/page/open', { item: { id: this.block.link.pageId } });
    }
    render() {
        var ta = <TextArea block={this.block} prop='content' ></TextArea>
        var classList: string[] = ['sy-block-text-content'];
        if (this.block.link) {
            if (this.block.link.pageId) {
                ta = <a onClick={e => e.preventDefault()} onMouseDown={e => this.openPage(e)} href={'/page/' + this.block.link.pageId}>{ta}</a>
            }
            else if (this.block.link.url) {
                ta = <a target='_blank' href={this.block.link.url}>{ta}</a>
            }
        }
        else if (this.block.code) {
            var next = this.block.next;
            classList.push('sy-block-text-content-code');
            ta = <em className={next && (next as TextContent).code ? "next-code" : ""}>{ta}</em>;
        }
        var style = this.block.visibleStyle;
        delete style.fontSize;
        delete style.lineHeight;
        return <span className={classList.join(" ")} style={style}>{ta}</span>
    }
}

