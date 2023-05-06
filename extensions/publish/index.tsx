import lodash from "lodash";
import React from "react";
import { CopyText } from "../../component/copy";
import { ShyAlert } from "../../component/lib/alert";
import { EventsComponent } from "../../component/lib/events.component";
import { CloseSvg, GlobalLinkSvg, LinkSvg, PlusSvg } from "../../component/svgs";
import { Avatar } from "../../component/view/avator/face";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItemType } from "../../component/view/menu/declare";
import { SelectBox } from "../../component/view/select/box";
import { Switch } from "../../component/view/switch";
import { channel } from "../../net/channel";
import { Point } from "../../src/common/vector/point";
import { Page } from "../../src/page";
import {
    AtomPermission,
    getAtomPermissionComputedChanges,
    getAtomPermissionOptions
} from "../../src/page/permission";
import { LinkPageItem } from "../at/declare";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";

class PagePublish extends EventsComponent {
    constructor(props) {
        super(props);
    }
    open(item: LinkPageItem, page: Page) {
        this.item = item;
        this.page = page;
        this.forceUpdate()
    }
    page: Page;
    copyLink() {
        CopyText(this.item.url);
        ShyAlert('页面访问链接已复制');
    }
    item: LinkPageItem = null;
    render() {
        var self = this;
        var ps: {
            roleId?: string;
            userid?: string;
            permissions: AtomPermission[];
        }[] = this.item?.memberPermissions || [];
        if (ps.length == 0) {
            ps.push(
                {
                    roleId: 'all',
                    permissions: [AtomPermission.docInteraction]
                }
            )
        }
        async function setGlobalShare(data) {
            await self.page.onUpdatePageData(data);
            Object.assign(self.item, data);
            self.forceUpdate()
        }
        async function addPermission(event: React.MouseEvent) {
            var rs = channel.query('/current/workspace')
            var r = await useSelectMenuItem({ roundPoint: Point.from(event) },
                [
                    {
                        text: '添加角色',
                        type: MenuItemType.text
                    },
                    {
                        text: '所有人',
                        name: "addRole",
                        value: 'all',
                        disabled: self.item.memberPermissions.some(s => s.roleId == 'all')
                    },
                    ...rs.roles.map(r => {
                        return {
                            text: r.text,
                            name: 'addRole',
                            value: r.id,
                            renderIcon: () => {
                                return <span
                                    className="size-16 circle"
                                    style={{ background: r.color }}>
                                </span>
                            },
                            disabled: self.item.memberPermissions.some(s => s.roleId == r.id)
                        }
                    })
                ]
            );
            if (r) {
                if (r.item.name == 'addMember') {

                }
                else if (r.item.name == 'addRole') {
                    self.item.memberPermissions.push({
                        roleId: r.item.value,
                        permissions: [AtomPermission.docInteraction]
                    });
                    self.forceUpdate()
                }
            }
        }
        async function remove(mp) {
            lodash.remove(ps, p => p.userid && p.userid == mp.userid || p.roleId && p.roleId == mp.roleId);
            await setGlobalShare({ 'memberPermissions': ps });
        }
        async function setMemberPermissions(mp, permissions: AtomPermission[]) {
            mp.permissions = permissions;
            await setGlobalShare({ 'memberPermissions': ps });
        }
        function getRoles(roleId) {
            if (roleId == 'all') return '所有人'
            var rs = channel.query('/current/workspace')
            return rs.roles.find(g => g.id == roleId)?.text
        }
        if (!this.item) return <div className='w-300 min-h-60'></div>
        return <div className='w-300 min-h-60 padding-t-10 round f-14'>
            <div className="flex  padding-w-14">
                <span className="flex-auto remark">空间成员</span>
                <span onMouseDown={e => addPermission(e)} className="flex-fixed flex-center size-24 item-hover round cursor"><Icon icon={PlusSvg}></Icon></span>
            </div>
            <div >
                {ps.map((mp, id) => {
                    return <div className="flex gap-h-10 padding-w-14 item-hover round" key={id}>
                        <div className="flex-fixed">
                            {mp.userid && <Avatar size={30} userid={mp.userid}></Avatar>}
                            {mp.roleId && <span>{getRoles(mp.roleId)}</span>}
                        </div>
                        <div className="flex-auto flex flex-end">
                            <div className="flex-fixed gap-r-5 flex-end">
                                <SelectBox
                                    small
                                    dropWidth={120}
                                    border
                                    multiple
                                    computedChanges={async (vs, v) => {
                                        return getAtomPermissionComputedChanges(this.page.pageLayout.type, vs, v);
                                    }}
                                    options={getAtomPermissionOptions(this.page.pageLayout.type)}
                                    value={mp.permissions || []}
                                    onChange={e => { setMemberPermissions(mp, e) }}
                                ></SelectBox>
                            </div>
                            {mp.roleId != 'all' && <span
                                onMouseDown={e => remove(mp)}
                                className="flex-fixed flex-center size-24 round item-hover cursor"><Icon
                                    size={16} icon={CloseSvg}></Icon></span>}
                        </div>
                    </div>
                })}
            </div>
            <Divider></Divider>
            <div className="item-hover h-30 flex padding-w-14">
                <span className="flex-auto flex">
                    <Icon size={18} icon={GlobalLinkSvg}></Icon>
                    <span className="gap-l-5">公开至互联网</span>
                </span>
                <span className="flex-fixed">
                    <Switch checked={this.item?.share == 'net' ? true : false} onChange={e => setGlobalShare({ share: e ? "net" : 'nas' })}></Switch>
                </span>
            </div>
            {this.item.share == 'net' && <>
                <div className="flex item-hover h-30 flex padding-w-14">
                    <div className="flex-auto">
                        页面公开访问权限
                    </div>
                    <div className="flex-fixed">
                        <SelectBox
                            small
                            border
                            multiple
                            computedChanges={async (vs, v) => {
                                return getAtomPermissionComputedChanges(this.page.pageLayout.type, vs, v);
                            }}
                            options={getAtomPermissionOptions(this.page.pageLayout.type)}
                            value={this.item.netPermissions || []}
                            onChange={e => { setGlobalShare({ 'netPermissions': e }) }}
                        ></SelectBox>
                    </div>
                </div>
            </>}
            <Divider></Divider>
            <div className="item-hover h-30  cursor  padding-w-14 flex"
                onClick={e => this.copyLink()}>
                <Icon size={18} icon={LinkSvg}></Icon><span className="gap-l-5">复制页面访问链接</span>
            </div>
        </div>
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