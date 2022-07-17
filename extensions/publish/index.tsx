import React from "react";
import { CopyText } from "../../component/copy";
import { ShyAlert } from "../../component/lib/alert";
import { EventsComponent } from "../../component/lib/events.component";
import { GlobalLinkSvg, LinkSvg } from "../../component/svgs";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { Switch } from "../../component/view/switch";
import { channel } from "../../net/channel";
import { PagePermission } from "../../src/page/permission";
import { LinkPageItem } from "../at/declare";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";

class PagePublish extends EventsComponent {
    constructor(props) {
        super(props);
    }
    open(item: LinkPageItem) {
        this.item = item;
    }
    copyLink() {
        CopyText(this.item.url);
        ShyAlert('页面访问链接已复制');
    }
    item: LinkPageItem = null;
    render() {
        var self = this;
        function setGlobalShare(data) {
            channel.air('/page/update/info', { id: self.item.id, pageInfo: data });
        }
        return <div className='shy-page-publish'>
            <div className='shy-page-publish-access'>
                <div className='shy-page-publish-access-icon'>
                    <Icon size={36} icon={GlobalLinkSvg}></Icon>
                    <div>
                        <span>公开至互联网</span>
                        <label>任何人都可以{this.item?.permission == PagePermission.canEdit ? "编辑" : (this.item?.permission == PagePermission.canInteraction ? "浏览、添加评论、数据" : "浏览")}</label>
                    </div>
                </div>
                <Switch checked={this.item?.share == 'net' ? true : false} onChange={e => setGlobalShare({ share: e ? "net" : 'nas' })}></Switch>
            </div>
            {this.item?.share == 'net' && <>
                <div className='shy-page-publish-permission'><span>可编辑</span><Switch checked={this.item.permission == PagePermission.canEdit} onChange={e => setGlobalShare({ permission: e ? PagePermission.canEdit : PagePermission.canView })}></Switch></div>
                <div className='shy-page-publish-permission'><span>可交互<em>(评论、添加数据)</em></span><Switch checked={this.item.permission == PagePermission.canInteraction} onChange={e => setGlobalShare({ permission: e ? PagePermission.canInteraction : PagePermission.canView })}></Switch></div>
            </>}
            <Divider></Divider>
            <div className="shy-page-publish-item" onClick={e => this.copyLink()}>
                <Icon size={18} icon={LinkSvg}></Icon><span>复制页面访问链接</span>
            </div>
        </div>
    }
}
export async function usePagePublish(pos: PopoverPosition, item: LinkPageItem) {
    let popover = await PopoverSingleton(PagePublish, { mask: true });
    let pagePublish = await popover.open(pos);
    pagePublish.open(item);
    return new Promise((resolve: (data: any) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        });
    })
}