import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { Block } from "../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { SolidArea } from "../../src/block/view/appear";
import { BoxTip } from "../../component/view/tooltip/box";
import { ToolTip } from "../../component/view/tooltip";
import { EditSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { useIconPicker } from "../../extensions/icon";
import { Rect } from "../../src/common/vector/point";
import { IconArguments } from "../../extensions/icon/declare";

@url('/emoji')
export class Emoji extends Block {
    @prop()
    src: IconArguments = { name: 'emoji', code: '😀' };
    display = BlockDisplay.inline;
}
@view('/emoji')
export class EmojiView extends BlockView<Emoji>{
    async openEdit(event: React.MouseEvent) {
        event.stopPropagation();
        if (this.boxTip) this.boxTip.close()
        var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) });
        if (typeof icon != 'undefined') {
            this.block.onUpdateProps({ src: icon }, { range: BlockRenderRange.self });
        }
    }
    boxTip: BoxTip;
    render() {
        var icon = this.block.src;
        if (icon.code && (icon as any).mime) {
            icon = { name: 'emoji', code: icon.code };
        }
        return <div className='sy-block-emoji'>
            <BoxTip ref={e => this.boxTip = e} overlay={<div className="flex-center">
                <ToolTip overlay={'编辑'}><a className="flex-center size-20 round item-hover gap-5 cursor" onMouseDown={e => this.openEdit(e)} ><Icon size={14} icon={EditSvg}></Icon></a></ToolTip>
            </div>}><SolidArea block={this.block} prop='src'><Icon icon={icon} size={16}></Icon></SolidArea>
            </BoxTip>
        </div>
    }
}