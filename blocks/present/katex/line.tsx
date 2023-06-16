import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { url, view } from "../../../src/block/factory/observable";
import { listenKatexInput } from "../../../extensions/katex";
import React from "react";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import { loadKatex } from "./load";
import { SolidArea } from "../../../src/block/view/appear";
import { BoxTip } from "../../../component/view/tooltip/box";
import { ToolTip } from "../../../component/view/tooltip";
import { DragBlockLine } from "../../../src/kit/handle/line";
import { Icon } from "../../../component/view/icon";
import { DragHandleSvg, EditSvg, TrashSvg } from "../../../component/svgs";
import { BlockUrlConstant } from "../../../src/block/constant";

@url('/katex/line')
export class KatexLine extends Block {
    display = BlockDisplay.inline;
    katexContent = '';
    opened: boolean = false;
    async didMounted() {
        await this.renderKatex();
    }
    async renderKatex() {
        this.katexContent = (await loadKatex()).renderToString(this.content, { throwOnError: false });
        this.forceUpdate()
    }
    async open(event: React.MouseEvent) {
        // event.stopPropagation();
        this.opened = true;
        var old = this.content;
        this.forceUpdate();
        var newValue = await listenKatexInput({ direction: "bottom", align: 'center', roundArea: Rect.fromEle(this.el) }, this.content, (data) => {
            this.content = data;
            this.forceUpdate()
        });
        this.opened = false;
        this.forceUpdate();
        if (newValue) {
            this.onManualUpdateProps({ cotnent: old }, { content: newValue });
            this.renderKatex()
        }
    }
    async onCrash(event: React.MouseEvent) {
        this.page.onTurn(this, BlockUrlConstant.Text, (nb, ob) => {
            this.page.addUpdateEvent(async () => {
                this.page.kit.anchorCursor.onFocusBlockAnchor(nb, { render: true, merge: true })
            })
        });
    }
    async getHtml() {
        return `<span class='sy-block-katex'>${this.content}</span>`
    }
    async getMd() {
        return ` ${this.content} `
    }
}
@view('/katex/line')
export class KatexView extends BlockView<KatexLine>{
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    boxTip: BoxTip;
    render() {
        return <span className={'sy-block-katex-line' + (this.block.opened ? " sy-block-katex-opened" : "")}
            onMouseDown={e => this.block.open(e)}>
            <BoxTip ref={e => this.boxTip = e} overlay={<div className="flex-center  padding-5 r-flex-center r-size-24 r-round r-item-hover r-cursor text">
                <ToolTip overlay={'拖动'}><span onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></span></ToolTip>
                <ToolTip overlay={'编辑'}><span onMouseDown={e => this.block.open(e)} ><Icon size={14} icon={EditSvg}></Icon></span></ToolTip>
                <ToolTip overlay={'删除'}><span onMouseDown={e => this.block.onCrash(e)} ><Icon size={14} icon={TrashSvg}></Icon></span></ToolTip>
            </div>}>
                <SolidArea line prop='content' isHtml={true} block={this.block} ><span dangerouslySetInnerHTML={{ __html: this.block.katexContent }}></span></SolidArea>
            </BoxTip>
        </span>
    }
}