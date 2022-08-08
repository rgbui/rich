
import { BlockView } from "../view";
import React from 'react';
import { BlockDisplay, BlockRenderRange } from "../enum";
import { prop, url, view } from "../factory/observable";
import { TextArea } from "../view/appear";
import { PageLink } from "../../../extensions/link/declare";
import { Block } from "..";
import { channel } from "../../../net/channel";
import lodash from "lodash";
import { BoxTip } from "../../../component/view/tooltip/box";
import { EditSvg, LinkSvg, TrashSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { ToolTip } from "../../../component/view/tooltip";
import { useLinkPicker } from "../../../extensions/link/picker";
import { Rect } from "../../common/vector/point";

/***
 * 文字型的block，
 * 注意该文字block里面含有子文字或其它的如图像block等
 * 
 */
@url('/text')
export class TextContent extends Block {
    display = BlockDisplay.inline;
    @prop()
    link: PageLink = null;
    @prop()
    comment: { id: string } = null;
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
            code: this.code
        }
    }
    async getPlain() {
        return this.content;
    }
}
@view('/text')
export class TextContentView extends BlockView<TextContent>{
    openPage(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        channel.air('/page/open', { item: { id: this.block.link.pageId } });
    }
    async openCreatePage(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        var r = await channel.air('/page/create/sub', {
            pageId: this.block.page.pageInfo?.id,
            text: this.block.content
        });
        if (r) {
            var pa = lodash.cloneDeep(this.block.link);
            pa.pageId = r.id;
            pa.name = 'page';
            delete pa.url;
            delete pa.text;
            this.block.onUpdateProps({ link: pa }, { range: BlockRenderRange.self })
        }
    }
    async onClearLink() {
        this.block.onUpdateProps({ link: null }, { range: BlockRenderRange.self })
    }
    async openLink(e: React.MouseEvent) {
        var pageLink = await useLinkPicker({ roundArea: Rect.fromEvent(e) }, lodash.cloneDeep(this.block.link));
        if (pageLink.name == 'create') {
            var r = await channel.air('/page/create/sub', {
                pageId: this.block.page.pageInfo?.id,
                text: this.block.content
            });
            if (r) {
                pageLink.pageId = r.id;
                pageLink.name = 'page';
                delete pageLink.url;
                delete pageLink.text;
            }
        }
        this.block.onUpdateProps({ link: pageLink }, { range: BlockRenderRange.self })
    }
    render() {
        var ta = <TextArea block={this.block} prop='content' ></TextArea>
        var classList: string[] = ['sy-block-text-content'];
        if (this.block.link) {
            if (this.block.link.name == 'page' && !this.block.link.pageId) {
                if (this.block.isCanEdit)
                    ta = <a className="sy-block-text-content-link">{ta}<i onMouseDown={e => this.openCreatePage(e)}>(创建)</i></a>
            }
            else if (this.block.link.pageId) {
                ta = <BoxTip placement="bottom" overlay={<div className="flex-center">
                    <ToolTip overlay={'/page/' + this.block.link.pageId}><a className="flex-center size-24 round item-hover gap-5 cursor" onMouseDown={e => this.openPage(e)} ><Icon size={14} icon={LinkSvg}></Icon></a></ToolTip>
                    <ToolTip overlay={'编辑'}><a className="flex-center size-24 round item-hover gap-5 cursor" ><Icon size={18} icon={EditSvg}></Icon></a></ToolTip>
                    <ToolTip overlay={'取消'}><a className="flex-center size-24 round item-hover gap-5 cursor" onMouseDown={e => this.onClearLink()}><Icon size={14} icon={TrashSvg}></Icon></a></ToolTip>
                </div>}><a className="sy-block-text-content-link" onClick={e => e.preventDefault()} onMouseDown={e => this.openPage(e)} href={'/page/' + this.block.link.pageId}>{ta}</a></BoxTip>
            }
            else if (this.block.link.url) {
                ta = <BoxTip placement="bottom" overlay={<div className="flex-center">
                    <ToolTip overlay={this.block.link.url}><a className="flex-center size-24 round item-hover gap-5 cursor" onMouseDown={e => this.openPage(e)} ><Icon size={14} icon={LinkSvg}></Icon></a></ToolTip>
                    <ToolTip overlay={'编辑'}><a className="flex-center size-24 round item-hover gap-5 cursor"><Icon size={18} icon={EditSvg}></Icon></a></ToolTip>
                    <ToolTip overlay={'取消'}><a className="flex-center size-24 round item-hover gap-5 cursor" onMouseDown={e => this.onClearLink()}><Icon size={14} icon={TrashSvg}></Icon></a></ToolTip>
                </div>}><a className="sy-block-text-content-link" target='_blank' href={this.block.link.url}>{ta}</a></BoxTip>
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



