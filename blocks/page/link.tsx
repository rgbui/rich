
import React from "react";
import { PageSvg } from "../../component/svgs";
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
    pageUrl: string;
    get isSupportTextStyle() {
        return false;
    }
    async loadPageInfo() {
        var r = await channel.get('/page/query/info', { id: this.pageId });
        if (r?.ok) {
            if (r.data.icon) this.icon = r.data.icon;
            if (r.data.text) this.text = r.data.text;
            if (r.data.url) this.pageUrl = r.data.url;
        }
    }
    async openPage(event: React.MouseEvent) {
        event.preventDefault();
        channel.air('/page/open', { item: { id: this.pageId } });
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
            if (typeof pageInfo.icon != 'undefined' && JSON.stringify(pageInfo.icon) != JSON.stringify(this.block.icon)) {
                this.block.icon = pageInfo.icon;
                isUpdate = true;
            }
            if (typeof pageInfo.url != 'undefined')
                this.block.pageUrl = pageInfo.url;
            if (isUpdate)
                this.forceUpdate();
        }
    }
    willUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
    }
    render() {
        return <div className='sy-block-link'>
            {this.block.text && <a href={this.block.pageUrl} onClick={e => this.block.openPage(e)}>
                <i><Icon size={18} icon={this.block.icon || PageSvg}></Icon></i>
                <span>{this.block.text}</span>
            </a>}
        </div>
    }
}