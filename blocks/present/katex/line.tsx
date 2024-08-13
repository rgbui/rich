import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { url, view } from "../../../src/block/factory/observable";
import { useKatexInput } from "../../../extensions/katex";
import React from "react";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import { loadKatex } from "../../../component/view/katex/load";
import { SolidArea } from "../../../src/block/view/appear";
import { BoxTip } from "../../../component/view/tooltip/box";
import { ToolTip } from "../../../component/view/tooltip";
import { DragBlockLine } from "../../../src/kit/handle/line";
import { Icon } from "../../../component/view/icon";
import { DragHandleSvg, DuplicateSvg, Edit1Svg, TrashSvg } from "../../../component/svgs";
import { BlockUrlConstant } from "../../../src/block/constant";
import { lst } from "../../../i18n/store";
import { Tip } from "../../../component/view/tooltip/tip";
import { CopyAlert } from "../../../component/copy";

@url('/katex/line')
export class KatexLine extends Block {
    display = BlockDisplay.inline;
    katexContent = '';
    opened: boolean = false;
    async didMounted() {
        await this.onBlockReloadData(async () => {
            await this.renderKatex();
        })
    }
    async renderKatex() {
        try {
            this.katexContent = (await loadKatex()).renderToString(this.content, { throwOnError: false });
        }
        catch (ex) {
            console.error(ex);
            console.log('katex error:', this.content)
            this.katexContent = this.content;
        }
        this.forceManualUpdate()
    }
    async open(event: React.MouseEvent) {
        // event.stopPropagation();
        this.opened = true;
        var old = this.content;
        this.forceManualUpdate();
        var newValue = await useKatexInput({ direction: "bottom", align: 'center', roundArea: Rect.fromEle(this.el) }, this.content, (data) => {
            this.content = data;
            this.forceManualUpdate()
        });
        this.opened = false;
        this.forceManualUpdate();
        if (newValue) {
            this.onManualUpdateProps({ cotnent: old }, { content: newValue });
            this.renderKatex()
        }
    }
    async onCrash(event: React.MouseEvent) {
        this.page.onTurn(this, BlockUrlConstant.Text, async (nb, ob) => {
            this.page.addActionAfterEvent(async () => {
                this.page.kit.anchorCursor.onFocusBlockAnchor(nb, { render: true, merge: true })
            })
        });
    }
    async getHtml() {
        return `<span class='sy-block-katex'>${this.content}</span>`
    }
    async getMd() {
        return ` ${this.content}`
    }
}
@view('/katex/line')
export class KatexView extends BlockView<KatexLine> {
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    boxTip: BoxTip;
    renderView() {
        return <span className={'sy-block-katex-line cursor ' + (this.block.opened ? " sy-block-katex-opened" : "")}
            onMouseDown={e => this.block.open(e)}>
            <BoxTip ref={e => this.boxTip = e} overlay={<div className="flex-center  padding-5 r-flex-center r-size-24 r-round r-item-hover r-cursor text">
                {this.block.isCanEdit() && <><ToolTip overlay={lst('拖动')}><span onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></span></ToolTip>
                    <ToolTip overlay={lst('编辑')}><span onMouseDown={e => this.block.open(e)} ><Icon size={14} icon={Edit1Svg}></Icon></span></ToolTip>
                    <ToolTip overlay={lst('删除')}><span onMouseDown={e => this.block.onCrash(e)} ><Icon size={14} icon={TrashSvg}></Icon></span></ToolTip></>}
                {!this.block.isCanEdit() && <Tip text='复制'><span onMouseDown={e => { e.stopPropagation(); CopyAlert(this.block.content, lst('公式已复制')) }}><Icon size={14} icon={DuplicateSvg}></Icon></span></Tip>}
            </div>}>
                <SolidArea  prop='content' isHtml={true} block={this.block} ><span dangerouslySetInnerHTML={{ __html: this.block.katexContent }}></span></SolidArea>
            </BoxTip>
        </span>
    }
}