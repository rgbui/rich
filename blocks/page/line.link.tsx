


import React from "react";
import { PageSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { LinkPageItem } from "../../extensions/at/declare";
import { IconArguments } from "../../extensions/icon/declare";
import { channel } from "../../net/channel";
import { Block } from "../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SolidArea } from "../../src/block/view/appear";
import "./style.less";

/*******
 * 
 * 该块弃用
 * 使用Text中的link来实现双链链接
 * 
 */
@url('/link/line')
export class LineLink extends Block {
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
        if (this.pageId) {
            var r = await channel.get('/page/query/info', { id: this.pageId });
            if (r?.ok) {
                if (r.data.icon) this.icon = r.data.icon;
                if (r.data.text) this.text = r.data.text;
                if (r.data.url) this.pageUrl = r.data.url;
            }
        }
    }
    async openPage(event: React.MouseEvent) {
        event.preventDefault();
        channel.air('/page/open', { item: { id: this.pageId } });
    }
    async didMounted() {
        try {
            if (this.createSource == 'InputBlockSelector') {
                if ((this as any).createPage) {
                    var newItem = await channel.air('/page/create/sub', {
                        pageId: this.page.pageInfo?.id,
                        text: this.text
                    });
                    if (newItem)
                        this.onUpdateProps({ pageId: newItem.id }, { range: BlockRenderRange.self, merge: true });
                }
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
}
@view('/link/line')
export class LinkView extends BlockView<LineLink>{
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
        return <span className='sy-block-line-link'>
            {this.block.pageId && <a href={this.block.pageUrl} onClick={e => this.block.openPage(e)}>
                <i><Icon size={this.block.page.fontSize} icon={this.block.icon || PageSvg}></Icon></i>
                <SolidArea block={this.block} prop={'text'} ><span>{this.block.text || '新页面'}</span></SolidArea>
            </a>}
        </span>
    }
}