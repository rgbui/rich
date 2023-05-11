
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
    isEqualFormat(block: TextContent) {
        if (this.pattern.isEqual(block.pattern)) {
            if (this.code == true && block.code == true) return true;
            if (this.comment && block.comment && lodash.isEqual(this.comment, block.comment)) return true;
            if (this.link && block.link && lodash.isEqual(this.link, block.link)) return true;
            if (this.code == false && block.code == false) {
                if (!this.link && !block.link && !this.comment && !block.comment) return true;
            }
        }
        return false;
    }
    async didMounted() {
        await this.createLink();
    }
    async createLink() {
        if (this.createSource == 'InputBlockSelector') {
            if (this.link) {
                if (this.link.name == 'create') {
                    var r = await channel.air('/page/create/sub', {
                        pageId: this.page.pageInfo?.id,
                        text: this.link.text
                    });
                    if (r) {
                        var pa = lodash.cloneDeep(this.link);
                        pa.pageId = r.id;
                        pa.name = 'page';
                        delete pa.url;
                        delete pa.text;
                        await this.onUpdateProps({ link: pa }, { range: BlockRenderRange.self, merge: true })
                        this.syncRefLink(r.id);
                    }
                }
            }
        }
    }
    async syncRefLink(pageId: string) {
        var rb = this.closest(x => x.isBlock);
        await channel.put('/block/ref/add', {
            pageId,
            data: {
                blockId: this.id,
                rowBlockId: rb.id,
                refPageId: this.page.pageInfo.id,
                text: JSON.stringify(await rb.childs.asyncMap(async c => (await c.get()))),
            }
        })
    }
    get isBlankPlain() {
        if (this.link) return false;
        if (this.code == true) return false;
        if (this.pattern.getFontStyle()?.color) return false;
        if (this.pattern.getFillStyle()?.color) return false;
        return true;
    }
    async getHtml() {
        if (this.link) return `<a href='${this.link.url}'>${this.content}</a>`
        else if (this.code) return `<pre>${this.content}</pre>`
        else {
            return `<span>${this.content}</span>`
        }
    }
}
@view('/text')
export class TextContentView extends BlockView<TextContent>{
    openPage(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        console.log('this', this.boxTip);
        if (this.boxTip) this.boxTip.close();
        channel.air('/page/open', { item: { id: this.block.link.pageId } });
    }
    async openCreatePage(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        if (this.boxTip) this.boxTip.close();
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
            this.block.syncRefLink(r.id);
        }
    }
    async onClearLink() {
        if (this.boxTip)
            this.boxTip.close();
        this.block.onUpdateProps({ link: null }, { range: BlockRenderRange.self })
    }
    async openLink(e: React.MouseEvent) {
        if (this.boxTip)
            this.boxTip.close();
        var lc = lodash.cloneDeep(this.block.link);
        if (lc.name == 'page') {
            lc.text = this.block.content;
        }
        var pageLink = await useLinkPicker({ roundArea: Rect.fromEvent(e) }, lc);
        if (pageLink) {
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
            this.block.onUpdateProps({ link: pageLink }, { range: BlockRenderRange.self });
            this.block.syncRefLink(r.id);
        }
    }
    boxTip: BoxTip;
    render() {
        var ta = <TextArea block={this.block} prop='content' ></TextArea>
        var classList: string[] = ['sy-block-text-content'];
        if (this.block.link) {
            ta = <span>{this.block.content}</span>;
            if (this.block.link.name == 'page' && !this.block.link.pageId) {
                if (this.block.isCanEdit())
                    ta = <BoxTip ref={e => this.boxTip = e} placement="bottom" overlay={<div className="flex-center"><ToolTip overlay={'取消'}><a className="flex-center size-24 round item-hover gap-5 cursor" onMouseDown={e => this.onClearLink()}><Icon size={14} icon={TrashSvg}></Icon></a></ToolTip>
                    </div>}><a className="sy-block-text-content-link">{ta}<i onMouseDown={e => this.openCreatePage(e)}>(创建)</i></a>
                    </BoxTip>
            }
            else if (this.block.link.pageId) {
                var url = (channel.query('/current/workspace')?.url || "") + "/page/" + this.block.link.pageId;
                ta = <BoxTip ref={e => this.boxTip = e} placement="bottom" overlay={<div className="flex-center">
                    <ToolTip overlay={url}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.openPage(e)} ><Icon size={16} icon={LinkSvg}></Icon></a></ToolTip>
                    <ToolTip overlay={'编辑'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.openLink(e)}><Icon size={16} icon={EditSvg}></Icon></a></ToolTip>
                    <ToolTip overlay={'取消'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.onClearLink()}><Icon size={16} icon={TrashSvg}></Icon></a></ToolTip>
                </div>}><a className="sy-block-text-content-link" onClick={e => this.openPage(e)} href={url}>{ta}</a></BoxTip>
            }
            else if (this.block.link.url) {
                ta = <BoxTip ref={e => this.boxTip = e} placement="bottom" overlay={<div className="flex-center">
                    <ToolTip overlay={this.block.link.url}><a href={this.block.link.url} target='_blank' className="flex-center size-24 round item-hover gap-5 cursor text"><Icon size={16} icon={LinkSvg}></Icon></a></ToolTip>
                    <ToolTip overlay={'编辑'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.openLink(e)}><Icon size={16} icon={EditSvg}></Icon></a></ToolTip>
                    <ToolTip overlay={'取消'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.onClearLink()}><Icon size={16} icon={TrashSvg}></Icon></a></ToolTip>
                </div>}><a className="sy-block-text-content-link" target='_blank' href={this.block.link.url}>{ta}</a></BoxTip>
            }
        }
        else if (this.block.code) {
            var next = this.block.next;
            classList.push('sy-block-text-content-code');
            ta = <em className={next && (next as TextContent).code ? "next-code" : ""}>{ta}</em>;
        }
        var style = this.block.pattern.style;
        delete style.fontSize;
        delete style.lineHeight;
        return <span className={classList.join(" ")} style={style}>{ta}</span>
    }
}



