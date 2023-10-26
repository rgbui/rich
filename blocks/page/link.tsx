
import React from "react";
import { Icon } from "../../component/view/icon";
import { channel } from "../../net/channel";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SolidArea } from "../../src/block/view/appear";
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
            var r = await channel.get('/page/query/info', { ws: this.page.ws, id: this.pageId });
            if (r?.ok) {
                this.pageInfo = lodash.cloneDeep(r.data);
                this.forceUpdate();
            }
        }
    }
    async openPage(event: React.MouseEvent) {
        if (!this.pageId) return;
        event.preventDefault();
        channel.air('/page/open', { item: this.pageId });
    }
    async getMd() {
        var ws = this.page.ws;
        return `[${this.pageInfo?.text}](${ws.url + '/page/' + this.pageInfo?.sn})`
    }
}
@view('/link')
export class LinkView extends BlockView<Link>{
    async didMount() {
        channel.sync('/page/update/info', this.updatePageInfo);
        await this.block.loadPageInfo();
    }
    updatePageInfo = (data: { id: string, pageInfo: LinkPageItem }) => {
        var { id, pageInfo } = data;
        if (this.block.pageId && this.block.pageId == id) {
            var isUpdate: boolean = false;
            if (!lodash.isEqual(lodash.pick(this.block.pageInfo, ['text', 'icon']), lodash.pick(pageInfo, ['text', 'icon']))) {
                isUpdate = true;
                this.block.pageInfo = lodash.cloneDeep(pageInfo);
            }
            if (isUpdate)
                this.forceUpdate();
        }
    }
    willUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
    }
    renderView() {
        return <div style={this.block.visibleStyle}><div className='sy-block-link'>
            {this.block.pageInfo &&
                <a style={this.block.contentStyle} href={this.block.pageInfo.url} onClick={e => this.block.openPage(e)}>
                    <SolidArea block={this.block} prop='text'>
                        <div className="flex">
                            <i className="flex-fixed text flex-inline flex-center size-24 gap-r-5"><Icon size={20} icon={getPageIcon(this.block.pageInfo)}></Icon></i>
                            <div className="flex-auto "><span className="sy-block-link-text text-overflow" style={{ height: this.block.page.lineHeight, lineHeight: this.block.page.lineHeight + 'px' }}>
                                {getPageText(this.block.pageInfo)}
                            </span>
                            </div>
                        </div>
                    </SolidArea>
                </a>
            }
            {this.block.outsideUrl && <a style={this.block.contentStyle} href={this.block.outsideUrl}><SolidArea line block={this.block} prop='outsideUrl'><span>{this.block.outsideUrl}</span></SolidArea></a>}
        </div>
        </div>
    }
}