import React from "react";
import { UserBox } from "../../component/view/avator/user";
import { Block } from "../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
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
import { util } from "../../util/util";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import "./style.less";
import { RefPageLink } from "../../extensions/link/declare";

@url('/user/mention')
export class ShyMention extends Block {
    display = BlockDisplay.inline;
    @prop()
    refLinks: RefPageLink[] = [];
    async getHtml() {
        var rf = (this.refLinks || [])[0];
        if (!rf) return '<a>@' + lst('某人') + '</a>'
        var username = (this.view as any)?.username;
        if (rf.userid == 'all') username = lst('所有人');
        return `<a class='shy-user' data-userid='${rf?.userid}'>@${username}</a>`
    }
    async getMd() {
        return `@${(this.view as any)?.username}`;
    }
    async didMounted() {
        if (this.createSource == 'InputBlockSelector') {
            if (!(Array.isArray(this.refLinks) && this.refLinks.length > 0)) {
                (this.view as any).openUser({ roundArea: Rect.fromEle(this.el) })
            }
        }
    }
}

@view('/user/mention')
export class ShyMentionView extends BlockView<ShyMention> {
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    async openUser(pos: PopoverPosition) {
        var r = await useUserPicker(pos, this.block.page?.ws);
        if (r) {
            var rf = (this.block.refLinks || [])[0];
            if (!rf) {
                rf = { id: util.guid(), type: 'mention', userid: r.id }
            }
            else rf.userid = r.id;
            await this.block.onUpdateProps({ refLinks: [rf] }, { range: BlockRenderRange.self })
        }
    }
    async onClearLink() {
        if (this.boxTip) this.boxTip.close();
        await this.block.page.onReplace(this.block, [{ url: BlockUrlConstant.Text, content: `@${this.username}` }])
    }
    async openUserCard(event: React.MouseEvent) {
        var rf = (this.block.refLinks || [])[0];
        if (!rf) return;
        if (rf.userid == 'all') return;
        if (!rf.userid) return;
        event.stopPropagation();
        await useUserCard({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, { ws: this.block.page?.ws, userid: rf.userid });
    }
    boxTip: BoxTip;
    username: string = '';
    renderView() {
        var rf = (this.block.refLinks || [])[0];
        if (!rf?.userid) return <span onMouseDown={e => this.openUser({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) })} className="remark bg-error round cursor">
            @<S>某人</S>
        </span>
        return <span onMouseDown={e => this.openUserCard(e)} >
            <BoxTip disabled={this.block.isCanEdit() ? false : true} ref={e => this.boxTip = e} placement="bottom" overlay={<div className="flex-center">
                <Tip text={'拖动'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></a></Tip>
                {rf.userid !== 'all' && rf.userid && <Tip text={'打开'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.openUserCard(e)}><Icon size={16} icon={{ name: 'byte', code: 'people-top-card' }}></Icon></a></Tip>}
                <Tip text={'编辑'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.openUser({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) })}><Icon size={16} icon={{ name: 'byte', code: 'write' }}></Icon></a></Tip>
            </div>}><SolidArea block={this.block} prop={'userid'} >
                    {rf.userid == 'all' && <span className='sy-block-mention'>@所有人</span>}
                    {rf.userid != 'all' && rf.userid && <UserBox userid={rf.userid}>{(user) => {
                        this.username = user.name;
                        return <span className='sy-block-mention' >@<span>{user.name}</span></span>
                    }}
                    </UserBox>}
                    {!rf.userid && <span className='sy-block-mention'>@</span>}
                </SolidArea>
            </BoxTip>
        </span>
    }
}
