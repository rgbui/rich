

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
    get isSupportTextStyle() {
        return false;
    }
    async loadPageInfo() {
        var r = await messageChannel.fireAsync(Directive.getPageInfo, this.pageId);
        if (r) {
            if (r.icon) this.icon = r.icon;
            if (r.text) this.text = r.text;
        }
    }
}
@view('/link')
export class LinkView extends BlockView<Link>{
    async didMount() {
        messageChannel.on(Directive.UpdatePageItem, this.updatePageInfo)
        await this.block.loadPageInfo();
        this.forceUpdate();
    }
    updatePageInfo = (id: string, pageInfo: { text: string, icon?: IconArguments }) => {
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
            if (isUpdate)
                this.forceUpdate();
        }
    }
    willUnmount() {
        messageChannel.off(Directive.UpdatePageItem, this.updatePageInfo);
    }
    render() {
        return <div className='sy-block-link'>
            {this.block.icon && <a>
                <Icon size={36} icon={this.block.icon}></Icon>
                <span>{this.block.text}</span>
            </a>}
        </div>
    }
}