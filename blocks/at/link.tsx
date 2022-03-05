

import lodash from "lodash";
import React from "react";
import { Icon } from "../../component/view/icon";
import { LinkPageItem } from "../../extensions/at/declare";
import { IconArguments } from "../../extensions/icon/declare";

import { channel } from "../../net/channel";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";

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
        // var r = await  messageChannel.fireAsync(Directive.getPageInfo, this.pageId);
        var r = await channel.get('/page/query/info', { id: this.pageId });
        if (r?.ok) {
            if (r.data.icon) this.icon = r.data.icon;
            if (r.data.text) this.text = r.data.text;
            if (r.data.sn) this.sn = r.data.sn;
        }
    }
    async openPage(event: React.MouseEvent) {
        event.preventDefault();
        channel.fire('/page/open', { item: this.pageId });
    }
}
@view('/link')
export class LinkView extends BlockView<Link>{
    async didMount() {
        channel.sync('/page/update/info', this.updatePageInfo);
        await this.block.loadPageInfo();
        this.forceUpdate();
    }
    updatePageInfo = (data: { id: string, pageInfo: LinkPageItem }) => {
        var { id, pageInfo } = data;
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
        channel.off('/page/update/info', this.updatePageInfo);
    }
    render() {
        return <div className='sy-block-link'>
            {this.block.icon && <a href={'https://shy.live/page/' + this.block.sn} onClick={e => this.block.openPage(e)}>
                <i><Icon size={18} icon={this.block.icon}></Icon></i>
                <span>{this.block.text}</span>
            </a>}
        </div>
    }
}