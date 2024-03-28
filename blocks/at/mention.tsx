import React from "react";
import { UserBox } from "../../component/view/avator/user";
import { Block } from "../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SolidArea } from "../../src/block/view/appear";
import { BoxTip } from "../../component/view/tooltip/box";
import { DragHandleSvg, EditSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { DragBlockLine } from "../../src/kit/handle/line";
import { useUserPicker } from "../../extensions/at/picker";
import { Rect } from "../../src/common/vector/point";
import { BlockUrlConstant } from "../../src/block/constant";
import { useUserCard } from "../../component/view/avator/card";
import { Tip } from "../../component/view/tooltip/tip";
import { PopoverPosition } from "../../component/popover/position";
import "./style.less";

@url('/user/mention')
export class ShyMention extends Block {
    @prop()
    userid: string = '';
    display = BlockDisplay.inline;
    async getHtml() {
        return `<a class='shy-user' data-userid='${this.userid}'>@${(this.view as any)?.username}</a>`
    }
    async getMd() {
        return `@${(this.view as any)?.username}`;
    }
    async didMounted() {
        if (this.createSource == 'InputBlockSelector') {
            if (this.userid) {
                (this.view as any).openUser({ roundArea: Rect.fromEle(this.el) })
            }
        }
    }
}

@view('/user/mention')
export class ShyMentionView extends BlockView<ShyMention>{
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    async openUser(pos: PopoverPosition) {
        var r = await useUserPicker(pos, this.block.page?.ws);
        if (r) {
            await this.block.onUpdateProps({ userid: r.id }, { range: BlockRenderRange.self })
        }
    }
    async onClearLink() {
        if (this.boxTip) this.boxTip.close();
        this.block.turn(BlockUrlConstant.Text)
        this.block.page.onReplace(this.block, [{ url: BlockUrlConstant.Text, content: `@${this.username}` }])
    }
    async openUserCard(event: React.MouseEvent) {
        if (this.block.userid == 'all') return;
        if (!this.block.userid) return;
        await useUserCard({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, { userid: this.block.userid });
    }
    boxTip: BoxTip;
    username: string = '';
    renderView() {
        return <span onMouseDown={e => this.openUserCard(e)} >
            <BoxTip disabled={this.block.isCanEdit() ? false : true} ref={e => this.boxTip = e} placement="bottom" overlay={<div className="flex-center">
                <Tip text={'拖动'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></a></Tip>
                {this.block.userid !== 'all' && this.block.userid && <Tip text={'打开'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.openUserCard(e)}><Icon size={16} icon={{ name: 'byte', code: 'people-top-card' }}></Icon></a></Tip>}
                <Tip text={'编辑'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.openUser({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) })}><Icon size={16} icon={EditSvg}></Icon></a></Tip>
            </div>}><SolidArea block={this.block} prop={'userid'} >
                    {this.block.userid == 'all' && <span className='sy-block-mention'>@所有人</span>}
                    {this.block.userid != 'all' && this.block.userid && <UserBox userid={this.block.userid}>{(user) => {
                        this.username = user.name;
                        return <span className='sy-block-mention' >@<span>{user.name}</span></span>
                    }}
                    </UserBox>}
                    {!this.block.userid && <span className='sy-block-mention'>@</span>}
                </SolidArea>
            </BoxTip>
        </span>
    }
}
