
import React from "react";
import { GlobalLinkSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { useLinkPicker } from "../../extensions/link/picker";
import { channel } from "../../net/channel";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SolidArea } from "../../src/block/view/appear";
import { Rect } from "../../src/common/vector/point";
import "./style.less";
import lodash from "lodash";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";

@url('/link')
export class Link extends Block {
    @prop()
    pageId: string;
    display = BlockDisplay.block;
    pageInfo: LinkPageItem
    @prop()
    outsideUrl: string;
    get isSupportTextStyle() {
        return false;
    }
    async loadPageInfo() {
        if (this.pageId) {
            var r = await channel.get('/page/query/info', { id: this.pageId });
            if (r?.ok) {
                this.pageInfo = lodash.cloneDeep(r.data);
            }
            this.forceUpdate();
        }
    }
    async openPage(event: React.MouseEvent) {
        if (!this.pageId) return;
        event.preventDefault();
        channel.air('/page/open', { item: this.pageId });
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
            if (!lodash.isEqual(lodash.pick(this.block.pageInfo, ['text', 'icon']), lodash.pick(pageInfo, ['text', 'icon']))) {
                isUpdate = true;
                this.block.pageInfo = lodash.cloneDeep(pageInfo)
            }
            if (isUpdate)
                this.forceUpdate();
        }
    }
    willUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
    }
    render() {
        return <div style={this.block.visibleStyle}><div className='sy-block-link'>
            {this.block.pageInfo &&
                <a style={this.block.contentStyle} href={this.block.pageInfo.url} onClick={e => this.block.openPage(e)}>
                    <SolidArea line block={this.block} prop='text'>
                        <i className="text flex-inline flex-center size-24 gap-r-5"><Icon size={20} icon={getPageIcon(this.block.pageInfo)}></Icon></i>
                        <span>{getPageText(this.block.pageInfo)}</span>
                    </SolidArea>
                </a>
            }
            {this.block.outsideUrl && <a style={this.block.contentStyle} href={this.block.outsideUrl}><SolidArea line block={this.block} prop='outsideUrl'><span>{this.block.outsideUrl}</span></SolidArea></a>}
            {!this.block.pageId && !this.block.outsideUrl && <div style={this.block.contentStyle} className='sy-block-link-create' onMouseDown={e => { e.stopPropagation(); this.block.onPickerLinker() }}><Icon size={20} icon={GlobalLinkSvg}></Icon>
                <span>添加链接</span>
            </div>}
        </div></div>
    }
}