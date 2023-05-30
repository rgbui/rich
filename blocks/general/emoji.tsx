import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { Block } from "../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { SolidArea } from "../../src/block/view/appear";
import { BoxTip } from "../../component/view/tooltip/box";
import { ToolTip } from "../../component/view/tooltip";
import { DragHandleSvg, EditSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { useIconPicker } from "../../extensions/icon";
import { Rect } from "../../src/common/vector/point";
import { IconArguments } from "../../extensions/icon/declare";
import { DragBlockLine } from "../../src/kit/handle/line";

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
}
@view('/emoji')
export class EmojiView extends BlockView<Emoji>{
    async openEdit(event: React.MouseEvent) {
        event.stopPropagation();
        if (this.boxTip) this.boxTip.close()
        var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) }, this.block.src);
        if (typeof icon != 'undefined') {
            this.block.onUpdateProps({ src: icon }, { range: BlockRenderRange.self });
        }
    }
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    boxTip: BoxTip;
    render() {
        var icon = this.block.src;
        if (icon.code && (icon as any).mime) {
            icon = { name: 'emoji', code: icon.code };
        }
        return <span>
            <BoxTip ref={e => this.boxTip = e} overlay={<div className="flex-center  padding-5 r-flex-center r-size-24 r-round r-item-hover r-cursor text">
                <ToolTip overlay={'拖动'}><span onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></span></ToolTip>
                <ToolTip overlay={'编辑'}><span onMouseDown={e => this.openEdit(e)} ><Icon size={14} icon={EditSvg}></Icon></span></ToolTip>
            </div>}><SolidArea line block={this.block} prop='src'><Icon icon={icon} size={16}></Icon></SolidArea>
            </BoxTip>
        </span>
    }
}