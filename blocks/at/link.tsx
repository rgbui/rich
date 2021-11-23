

import lodash from "lodash";
import React from "react";
import { Icon } from "../../component/view/icon";
import { IconArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { Directive } from "../../util/bus/directive";
import { messageChannel } from "../../util/bus/event.bus";

@url('/link')
export class Link extends Block {
    @prop()
    isShowIcon: boolean = true;
    @prop()
    pageId: string;
    display = BlockDisplay.block;
    icon: IconArguments;
    text: string;
    sn: number;
    get isSupportTextStyle() {
        return false;
    }
    async loadPageInfo() {
        var r = await messageChannel.fireAsync(Directive.getPageInfo, this.pageId);
        if (r) {
            if (r.icon) this.icon = r.icon;
            if (r.text) this.text = r.text;
            if (r.sn) this.sn = r.sn;
        }
    }
    async openPage(event: React.MouseEvent) {
        event.preventDefault();
        messageChannel.fire(Directive.openPageLink, { pageId: this.pageId, sn: this.sn });
    }
}
@view('/link')
export class LinkView extends BlockView<Link>{
    async didMount() {
        messageChannel.on(Directive.UpdatePageItem, this.updatePageInfo)
        await this.block.loadPageInfo();
        this.forceUpdate();
    }
    updatePageInfo = (id: string, pageInfo: { sn?: number, text: string, icon?: IconArguments }) => {
        if (this.block.pageId == id) {
            var isUpdate: boolean = false;
            if (typeof pageInfo.text != 'undefined' && pageInfo.text != this.block.text) {
                this.block.text = pageInfo.text;
                isUpdate = true;
            }
            if (typeof pageInfo.icon != 'undefined' && !lodash.isEqual(pageInfo.icon, this.block.icon)) {
                this.block.icon = pageInfo.icon;
                isUpdate = true;
            }
            if (typeof pageInfo.sn != 'undefined')
                this.block.sn = pageInfo.sn;
            if (isUpdate)
                this.forceUpdate();
        }
    }
    willUnmount() {
        messageChannel.off(Directive.UpdatePageItem, this.updatePageInfo);
    }
    render() {
        return <div className='sy-block-link'>
            {this.block.icon && <a href={'https://shy.live/page/' + this.block.sn} onClick={e => this.block.openPage(e)}>
                <Icon size={24} icon={this.block.icon}></Icon>
                <span>{this.block.text}</span>
            </a>}
        </div>
    }
}