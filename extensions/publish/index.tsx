import React from "react";
import { CopyText } from "../../component/copy";
import { ShyAlert } from "../../component/lib/alert";
import { EventsComponent } from "../../component/lib/events.component";
import { GlobalLinkSvg, LinkSvg, PlusSvg } from "../../component/svgs";
import { Avatar } from "../../component/view/avator/face";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { useSelectMenuItem } from "../../component/view/menu";
import { Switch } from "../../component/view/switch";
import { Point } from "../../src/common/vector/point";
import { Page } from "../../src/page";
import { LinkPageItem } from "../at/declare";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import "./style.less";

class PagePublish extends EventsComponent {
    constructor(props) {
        super(props);
    }
    open(item: LinkPageItem, page: Page) {
        this.item = item;
        this.page = page;
    }
    page: Page;
    copyLink() {
        CopyText(this.item.url);
        ShyAlert('页面访问链接已复制');
    }
    item: LinkPageItem = null;
    render() {
        var self = this;
        async function setGlobalShare(data) {
            await self.page.onUpdatePageData(data);
            self.forceUpdate()
        }
        async function addPermission(event: React.MouseEvent) {
            var r = await useSelectMenuItem({ roundPoint: Point.from(event) },
                [
                    { text: '添加角色', name: 'addRole' },
                    { text: '添加成员', name: 'addMember' }
                ]
            );
            if (r) {

            }
        }
        function getRoles(roleId) {
            return { text: '' }
        }
        return <div className='shy-page-publish'>
            <div className="flex">
                <span className="flex-auto">空间成员</span>
                <span className="flex-fixed size-24 item-hover round cursor"><Icon icon={PlusSvg}></Icon></span>
            </div>
            <div>
                {this.item.memberPermissions.map((mp, id) => {
                    return <div className="flex" key={id}>
                        <div className="flex-fixed">
                            {mp.userid && <Avatar userid={mp.userid}></Avatar>}
                            {mp.roleId && <span>{getRoles(mp.roleId).text}</span>}
                        </div>
                        <div className="flex-auto">

                        </div>
                    </div>
                })}
            </div>

            <Divider></Divider>
            <div className="item-hover">
                <span className="size-24"><Icon size={18} icon={GlobalLinkSvg}></Icon></span>
                <span>公开至互联网</span>
                <span>
                    <Switch checked={this.item?.share == 'net' ? true : false} onChange={e => setGlobalShare({ share: e ? "net" : 'nas' })}></Switch>
                </span>
            </div>
            <Divider></Divider>
            <div className="shy-page-publish-item" onClick={e => this.copyLink()}>
                <Icon size={18} icon={LinkSvg}></Icon><span>复制页面访问链接</span>
            </div>
        </div>
        // return <div className='shy-page-publish'>
        //     <div className='shy-page-publish-access'>
        //         <div className='shy-page-publish-access-icon'>
        //             <Icon size={36} icon={GlobalLinkSvg}></Icon>
        //             <div>
        //                 <span>公开至互联网</span>
        //                 <label>任何人都可以{this.item?.permission == PagePermission.canEdit ? "编辑" : (this.item?.permission == PagePermission.canInteraction ? "浏览、添加评论、数据" : "浏览")}</label>
        //             </div>
        //         </div>
        //         <Switch checked={this.item?.share == 'net' ? true : false} onChange={e => setGlobalShare({ share: e ? "net" : 'nas' })}></Switch>
        //     </div>
        //     {this.item?.share == 'net' && <>
        //         <div className='shy-page-publish-permission'><span>可编辑</span><Switch checked={this.item.permission == PagePermission.canEdit} onChange={e => setGlobalShare({ permission: e ? PagePermission.canEdit : PagePermission.canView })}></Switch></div>
        //         <div className='shy-page-publish-permission'><span>可交互<em>(评论、添加数据)</em></span><Switch checked={this.item.permission == PagePermission.canInteraction} onChange={e => setGlobalShare({ permission: e ? PagePermission.canInteraction : PagePermission.canView })}></Switch></div>
        //     </>}

        // </div>
    }
}
export async function usePagePublish(pos: PopoverPosition, item: LinkPageItem, page: Page) {
    let popover = await PopoverSingleton(PagePublish, { mask: true });
    let pagePublish = await popover.open(pos);
    pagePublish.open(item, page);
    return new Promise((resolve: (data: any) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        });
    })
}