import React from "react";
import { UserBox } from "../../component/view/avator/user";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SolidArea } from "../../src/block/view/appear";
import "./style.less";
import { BoxTip } from "../../component/view/tooltip/box";
import { DragHandleSvg, EditSvg, TrashSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { ToolTip } from "../../component/view/tooltip";
import { DragBlockLine } from "../../src/kit/handle/line";
import { useUserPicker } from "../../extensions/at/picker";
import { Rect } from "../../src/common/vector/point";
import { BlockUrlConstant } from "../../src/block/constant";
import { useUserCard } from "../../component/view/avator/card";

@url('/user/mention')
export class ShyMention extends Block {
    @prop()
    userid: string = '';
    display = BlockDisplay.inline;
}
@view('/user/mention')
export class ShyMentionView extends BlockView<ShyMention>{
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    async openUser(event: React.MouseEvent) {
        var r = await useUserPicker({ roundArea: Rect.fromEvent(event) });
        if (r) {
            this.block.onUpdateProps({ userid: r.id })
        }
    }
    async onClearLink() {
        if (this.boxTip) this.boxTip.close();
        this.block.turn(BlockUrlConstant.Text)
        this.block.page.onReplace(this.block, [{ url: BlockUrlConstant.Text, content: `@${this.username}` }])
    }
    async openUserCard(event: React.MouseEvent) {
        await useUserCard({ roundArea: Rect.fromEvent(event) }, { userid: this.block.userid });
    }
    boxTip: BoxTip;
    username: string = '';
    render() {
        return <span className='sy-block-mention' onMouseDown={e => this.openUserCard(e)} >
            <BoxTip ref={e => this.boxTip = e} placement="bottom" overlay={<div className="flex-center">
                <ToolTip overlay={'拖动'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></a></ToolTip>
                <ToolTip overlay={'打开'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.openUserCard(e)}><Icon size={16} icon={TrashSvg}></Icon></a></ToolTip>
                <ToolTip overlay={'编辑'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.openUser(e)}><Icon size={16} icon={EditSvg}></Icon></a></ToolTip>
            </div>}>
                <SolidArea block={this.block} prop={'userid'} ><UserBox userid={this.block.userid}>{(user) => {
                    this.username = user.name;
                    return <>@<span>{user.name}</span></>
                }}</UserBox></SolidArea>
            </BoxTip>
        </span>
    }
}
