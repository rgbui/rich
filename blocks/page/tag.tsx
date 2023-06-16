import React from "react";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SolidArea } from "../../src/block/view/appear";
import { Rect } from "../../src/common/vector/point";
import { useTagViewer } from "../../extensions/tag/view";
import { channel } from "../../net/channel";
import { BoxTip } from "../../component/view/tooltip/box";
import { DragHandleSvg, DuplicateSvg, EditSvg, TopicSvg, TrashSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { ToolTip } from "../../component/view/tooltip";
import { CopyAlert } from "../../component/copy";
import { DragBlockLine } from "../../src/kit/handle/line";
import { BlockUrlConstant } from "../../src/block/constant";

@url('/tag')
export class ShyTag extends Block {
    display = BlockDisplay.inline;
    @prop()
    refLinks: {
        id: string,
        type: 'page' | "tag" | "comment" | "mention" | "time",
        pageId?: string,
        tagId?: string,
        commentId?: string,
        userid?: string,
        tagText?: string
    }[] = null;
    async openTag(event: React.MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        var ref = this.refLinks[0];
        await useTagViewer(
            { roundArea: Rect.fromEvent(event) },
            { tagId: ref.tagId, tag: ref.tagText })
    }
    async didMounted() {
        this.loadTag();
    }
    async loadTag() {
        var g = await channel.get('/tag/query', { id: this.refLinks[0].tagId });
        if (g.ok) {
            this.refLinks[0].tagText = g.data?.tag?.tag;
            this.forceUpdate()
        }
    }
    async getHtml() {
        var ws = channel.query('/current/workspace')
        var ref = Array.isArray(this.refLinks) ? this.refLinks[0] : undefined;
        return `<a class='shy-tag' data-ws-id='${ws.id}' data-tag-id='${ref.tagId}'>#${ref.tagText}</a>`
    }
    async getMd() {
        var ws = channel.query('/current/workspace')
        var ref = Array.isArray(this.refLinks) ? this.refLinks[0] : undefined;
        return `[#${ref.tagText}](${ws.url + '/tag#' + ref.tagId})  `
    }
}
@view('/tag')
export class ShyMentionView extends BlockView<ShyTag>{
    boxTip: BoxTip;
    copyLink(url: string) {
        CopyAlert(url, '复制成功')
    }
    async onClearLink() {
        if (this.boxTip) this.boxTip.close();
        var ref = Array.isArray(this.block.refLinks) ? this.block.refLinks[0] : undefined;
        this.block.page.onReplace(this.block, {
            url: BlockUrlConstant.Text,
            content: ref.tagText
        })
    }
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    render() {
        var ref = Array.isArray(this.block.refLinks) ? this.block.refLinks[0] : undefined;
        return <span className="sy-block-tag" onMouseDown={e => this.block.openTag(e)}>
            <BoxTip ref={e => this.boxTip = e} placement="bottom" overlay={<div className="flex-center  padding-5 r-flex-center r-size-24 r-round r-item-hover r-cursor text">
                <ToolTip overlay={'拖动'}><span onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></span></ToolTip>
                {/* <ToolTip overlay={'复制网址'}><span onMouseDown={e => this.copyLink(url)} ><Icon size={16} icon={DuplicateSvg}></Icon></span></ToolTip> */}
                <ToolTip overlay={'打开'}><span onMouseDown={e => this.block.openTag(e)}><Icon size={16} icon={TopicSvg}></Icon></span></ToolTip>
                <ToolTip overlay={'取消'}><span onMouseDown={e => this.onClearLink()}><Icon size={16} icon={TrashSvg}></Icon></span></ToolTip>
            </div>}>
                <SolidArea block={this.block} prop={'userid'} >#{ref?.tagText}</SolidArea>
            </BoxTip>
        </span>
    }
}


