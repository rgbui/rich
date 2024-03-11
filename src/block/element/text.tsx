
import { BlockView } from "../view";
import React from 'react';
import { BlockDisplay, BlockRenderRange } from "../enum";
import { prop, url, view } from "../factory/observable";
import { SolidArea, TextArea } from "../view/appear";
import { PageLink } from "../../../extensions/link/declare";
import { Block } from "..";
import { channel } from "../../../net/channel";
import lodash from "lodash";
import { BoxTip } from "../../../component/view/tooltip/box";
import { DragHandleSvg, DuplicateSvg, Edit1Svg, EditSvg, GlobalLinkSvg, TrashSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { useLinkPicker } from "../../../extensions/link/picker";
import { Rect } from "../../common/vector/point";
import { DragBlockLine } from "../../kit/handle/line";
import { CopyAlert } from "../../../component/copy";
import { BlockUrlConstant } from "../constant";
import { util } from "../../../util/util";
import { S } from "../../../i18n/view";
import { Tip } from "../../../component/view/tooltip/tip";
import { lst } from "../../../i18n/store";

/***
 * 文字型的block，
 * 注意该文字block里面含有子文字或其它的如图像block等
 * 
 */
@url(BlockUrlConstant.Text)
export class TextContent extends Block {
    display = BlockDisplay.inline;
    @prop()
    link: PageLink = null;
    @prop()
    comment: { id: string } = null;
    @prop()
    code: boolean = false;
    @prop()
    refLinks: {
        id: string,
        type: 'page' | "tag" | "comment" | "mention" | "time",
        pageId?: string,
        tagId?: string,
        commentId?: string,
        userid?: string,
    }[] = null;
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
    /**
     * 是否是相同的格式
     * @param block 
     * @returns 
     */
    isEqualFormat(block: TextContent) {
        if (this.pattern.isEqual(block.pattern)) {
            if (this.code == true && block.code == true) return true;
            if (this.comment && block.comment && lodash.isEqual(this.comment, block.comment)) return true;
            if (this.link && block.link && lodash.isEqual(this.link, block.link)) return true;
            if (this.refLinks && block.refLinks && lodash.isEqual(this.refLinks, block.refLinks)) return true;
            if (this.code == false && block.code == false) {
                if (!this.link && !block.link && !this.comment && !block.comment && !this.refLinks && !block.refLinks) return true;
            }
        }
        return false;
    }
    get isBlankPlain() {
        if (this.link) return false;
        if (this.code == true) return false;
        if (this.pattern.getFontStyle()?.color) return false;
        if (this.pattern.getFillStyle()?.color) return false;
        return true;
    }
    async getHtml() {
        if (this.link) {
            if (!this.link.url) {
                return `<span>${this.content}</span>`
            }
            return `<a target='_blank' href='${this.link.url}'>${this.content}</a>`
        }
        else if (this.refLinks?.length > 0) {
            var pageId = this.link?.pageId || this.refLinks[0].pageId;
            var ws = this.page.ws;
            var url = (ws?.url || "") + "/page/" + pageId;
            return `<a data-page-id='${pageId}' data-ws-id='${ws?.id}' href='${url}'>${this.content}</a>`
        }
        else if (this.code) return `<pre>${this.content}</pre>`
        else {
            return `<span>${this.content}</span>`
        }
    }

    async getMd() {
        if (this.link) {
            if (!this.link.url) {
                return `${this.content}`
            }
            return `[${this.content}](${this.link.url})`
        }
        else if (this.refLinks?.length > 0) {
            var pageId = this.link?.pageId || this.refLinks[0].pageId;
            var ws = this.page.ws;
            var url = (ws?.url || "") + "/page/" + pageId;
            return `[${this.content}](${url})`
        }
        else if (this.code) return `\`${this.content}\``
        else {
            return `${this.content}`
        }
    }
}
@view(BlockUrlConstant.Text)
export class TextContentView extends BlockView<TextContent>{
    openPage(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        if (this.boxTip) this.boxTip.close();
        if (this.block.page.keyboardPlate.isShift()) return;
        var r = Array.isArray(this.block.refLinks) ? this.block.refLinks[0] : undefined;
        if (r) {
            channel.air('/page/open', { item: r.pageId });
        }
    }
    copyLink(url: string) {
        CopyAlert(url, lst('复制成功'))
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
            this.block.onUpdateProps({
                link: null,
                refLinks: [{ id: util.guid(), type: 'page', pageId: r.id }]
            }, { range: BlockRenderRange.self })
        }
    }
    async onClearLink() {
        if (this.boxTip) this.boxTip.close();
        this.block.page.onReplace(this.block, {
            url: BlockUrlConstant.Text,
            content: this.block.content
        })
    }
    async openLink(e: React.MouseEvent) {
        if (this.boxTip)
            this.boxTip.close();
        var lc: PageLink = {};
        if (this.block.link) {
            lc.name = 'outside';
            lc.url = this.block.link.url;
        }
        else if (Array.isArray(this.block.refLinks) && this.block.refLinks.length > 0) {
            lc.pageId = this.block.refLinks[0].pageId;
            lc.text = this.block.content;
        }
        var pageLink = await useLinkPicker({ roundArea: Rect.fromEvent(e) }, lc);
        if (pageLink) {
            if (lodash.isNull(pageLink.link)) {
                this.onClearLink();
            }
            else if (pageLink.link)
                this.block.onUpdateProps({ link: pageLink.link, refLinks: null }, { range: BlockRenderRange.self });
            else this.block.onUpdateProps({
                link: null,
                refLinks: pageLink.refLinks
            }, { range: BlockRenderRange.self })
        }
    }
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    boxTip: BoxTip;
    renderView() {
        var ta = <TextArea block={this.block} prop='content' ></TextArea>
        var classList: string[] = ['sy-block-text-content'];
        if (this.block.link || this.block.refLinks?.length > 0) {
            ta = <SolidArea block={this.block}>{this.block.content}</SolidArea>;
            if (this.block.link?.name == 'create') {
                if (this.block.isCanEdit())
                    ta = <BoxTip ref={e => this.boxTip = e} placement="bottom" overlay={<div className="flex-center padding-5 r-flex-center r-size-24 r-round r-item-hover r-cursor text">
                        <Tip text={'拖动'}><span onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></span></Tip>
                        <Tip text={'取消'}><span onMouseDown={e => this.onClearLink()}><Icon size={14} icon={TrashSvg}></Icon></span></Tip>
                    </div>}><a className="sy-block-text-content-link">{ta}<i onMouseDown={e => this.openCreatePage(e)}>(<S>创建</S>)</i></a>
                    </BoxTip>
            }
            else if (this.block.link?.pageId || this.block.refLinks?.length > 0) {
                var pageId = this.block.link?.pageId || this.block.refLinks[0].pageId;
                var url = (this.block.page.ws?.url || "") + "/page/" + pageId;
                ta = <BoxTip ref={e => this.boxTip = e} placement="bottom" align="left" overlay={<div className="flex-center  padding-5 r-flex-center r-size-24 r-round  r-cursor remark">
                    {this.block.isCanEdit() && <Tip text={'拖动'}><span className="item-hover" onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></span></Tip>}
                    <Tip overlay={url}><span className="max-w-160 padding-w-3 text-overflow " style={{ width: 'auto', justifyContent: 'flex-start' }}>{url}</span></Tip>
                    <Tip text={'复制网址'}><span className="item-hover" onMouseDown={e => this.copyLink(url)} ><Icon size={16} icon={DuplicateSvg}></Icon></span></Tip>
                    {this.block.isCanEdit() && <Tip text={'编辑'}><span className="item-hover" onMouseDown={e => this.openLink(e)}><Icon size={14} icon={Edit1Svg}></Icon></span></Tip>}
                </div>}><a className="sy-block-text-content-link" onClick={e => {
                    this.openPage(e)
                }} href={url}>{ta}</a></BoxTip>
            }
            else if (this.block.link?.url) {
                ta = <BoxTip ref={e => this.boxTip = e} placement="bottom" align="left" overlay={<div className="flex-center  padding-5  r-flex-center r-size-24 r-round  r-cursor remark">
                    {this.block.isCanEdit() && <Tip text={'拖动'}><span className="item-hover" onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></span></Tip>}
                    <Tip overlay={this.block.link.url}><span className="padding-w-3" style={{ width: 'auto' }}><Icon className={'gap-r-3'} icon={GlobalLinkSvg} size={14}></Icon><span className="max-w-160 text-overflow">{this.block.link?.url}</span></span></Tip>
                    <Tip text={'复制网址'}><span className="item-hover" onMouseDown={e => this.copyLink(this.block.link?.url)} ><Icon size={16} icon={DuplicateSvg}></Icon></span></Tip>
                    {this.block.isCanEdit() && <Tip text={'编辑'}><span className="item-hover" onMouseDown={e => this.openLink(e)}><Icon size={14} icon={Edit1Svg}></Icon></span></Tip>}
                </div>}><a className="sy-block-text-content-link" onClick={e => {
                    if (this.block.page.keyboardPlate.isShift()) {
                        e.preventDefault();
                    }
                }} target='_blank' href={this.block.link.url}>{ta}</a></BoxTip>
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
        style.padding = '2px 0px';
        style.borderRadius = '2px';
        return <span className={classList.join(" ")} style={style}>{ta}</span>
    }
}



