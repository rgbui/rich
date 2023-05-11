
import React from "react";
import { GlobalLinkSvg, PageSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { IconArguments } from "../../extensions/icon/declare";
import { useLinkPicker } from "../../extensions/link/picker";
import { channel } from "../../net/channel";
import { ElementType, getElementUrl } from "../../net/element.type";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SolidArea } from "../../src/block/view/appear";
import { Rect } from "../../src/common/vector/point";
import "./style.less";
import { LinkPageItem } from "../../src/page/declare";

@url('/link')
export class Link extends Block {
    @prop()
    pageId: string;
    display = BlockDisplay.block;
    icon: IconArguments;
    text: string;
    pageUrl: string;
    @prop()
    outsideUrl: string;
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
            this.forceUpdate();
        }
    }
    async openPage(event: React.MouseEvent) {
        if (!this.pageId) return;
        event.preventDefault();
        channel.air('/page/open', { elementUrl:getElementUrl(ElementType.PageItem,this.pageId) });
    }
    async onPickerLinker() {
        var pageLink = await useLinkPicker({ roundArea: Rect.fromEle(this.el) });
        if (pageLink) {
            if (pageLink.name == 'outside') {
                this.onUpdateProps({ outsideUrl: pageLink.url }, {
                    merge: this.createSource == 'InputBlockSelector' ? true : false
                })
            }
            else {
                if (pageLink.name == 'create') {
                    var r = await channel.air('/page/create/sub', { pageId: this.page.pageInfo?.id, text: pageLink.text || pageLink.url });
                    if (r) {
                        pageLink.pageId = r.id;
                        pageLink.name = 'page';
                        delete pageLink.url;
                        delete pageLink.text;
                    }
                }
                await this.onUpdateProps({ pageId: pageLink.pageId }, {
                    merge: this.createSource == 'InputBlockSelector' ? true : false
                });
                await this.loadPageInfo();
            }
        }
    }
}
@view('/link')
export class LinkView extends BlockView<Link>{
    async didMount() {
        channel.sync('/page/update/info', this.updatePageInfo);
        await this.block.loadPageInfo();
        if (!this.block.pageId && !this.block.outsideUrl) {
            if (this.block.createSource == 'InputBlockSelector') {
                this.block.onPickerLinker();
            }
        }
    }
    updatePageInfo = (data: { id: string, pageInfo: LinkPageItem }) => {
        var { id, pageInfo } = data;
        if (this.block.pageId && this.block.pageId == id) {
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
        return <div style={this.block.visibleStyle}> <div className='sy-block-link'>
            {this.block.pageId && <a style={this.block.contentStyle} href={this.block.pageUrl} onClick={e => this.block.openPage(e)}>
                <i className="text flex-center size-24 gap-r-5"><Icon size={16} icon={this.block.icon || PageSvg}></Icon></i>
                <SolidArea block={this.block} prop='text'><span>{this.block.text || '新页面'}</span></SolidArea>
            </a>}
            {this.block.outsideUrl && <a style={this.block.contentStyle} href={this.block.outsideUrl}><SolidArea block={this.block} prop='outsideUrl'><span>{this.block.outsideUrl}</span></SolidArea></a>}
            {!this.block.pageId && !this.block.outsideUrl && <div style={this.block.contentStyle} className='sy-block-link-create' onMouseDown={e => { e.stopPropagation(); this.block.onPickerLinker() }}><Icon size={16} icon={GlobalLinkSvg}></Icon>
                <span>添加链接</span>
            </div>}
        </div></div>
    }
}