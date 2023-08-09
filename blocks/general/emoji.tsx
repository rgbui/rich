import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { Block } from "../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { SolidArea } from "../../src/block/view/appear";
import { BoxTip } from "../../component/view/tooltip/box";
import { DragHandleSvg, Edit1Svg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { useIconPicker } from "../../extensions/icon";
import { Rect } from "../../src/common/vector/point";
import { IconArguments } from "../../extensions/icon/declare";
import { DragBlockLine } from "../../src/kit/handle/line";
import { Tip } from "../../component/view/tooltip/tip";

@url('/emoji')
export class Emoji extends Block {
    @prop()
    src: IconArguments = { name: 'emoji', code: '😀' };
    display = BlockDisplay.inline;
    async getHtml() {
        if (this.src && this.src.code) {
            return `<span>${this.src.code}</span>`
        }
        else return '';
    }
    async getMd() {
        return this.src?.code || '';
    }
}
@view('/emoji')
export class EmojiView extends BlockView<Emoji>{
    async openEdit(event: React.MouseEvent) {
        event.stopPropagation();
        if (this.boxTip) this.boxTip.close()
        var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) }, this.block.src);
        if (typeof icon != 'undefined') {
            if (icon == null) this.block.onDelete()
            else this.block.onUpdateProps({ src: icon }, { range: BlockRenderRange.self });
        }
    }
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    boxTip: BoxTip;
    renderView() {
        var icon = this.block.src;
        if (icon.code && (icon as any).mime) {
            icon = { name: 'emoji', code: icon.code };
        }
        return <span>
            <BoxTip disabled={this.block.isCanEdit() ? false : true} ref={e => this.boxTip = e} overlay={<div className="flex-center  padding-5 r-flex-center r-size-24 r-round r-item-hover r-cursor text">
                <Tip text={'拖动'}><span className="cursor-grab" onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></span></Tip>
                <Tip text={'编辑'}><span onMouseDown={e => this.openEdit(e)} ><Icon size={14} icon={Edit1Svg}></Icon></span></Tip>
            </div>}><SolidArea line block={this.block} prop='src'><Icon icon={icon} size={16}></Icon></SolidArea>
            </BoxTip>
        </span>
    }
}