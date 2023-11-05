import lodash from "lodash";
import React from "react";
import { CopyText } from "../../component/copy";
import { ShyAlert } from "../../component/lib/alert";
import { EventsComponent } from "../../component/lib/events.component";
import { CloseSvg, GlobalLinkSvg, PlusSvg } from "../../component/svgs";
import { Avatar } from "../../component/view/avator/face";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItemType } from "../../component/view/menu/declare";
import { SelectBox } from "../../component/view/select/box";
import { Switch } from "../../component/view/switch";
import { Point } from "../../src/common/vector/point";
import { Page } from "../../src/page";

import {
    AtomPermission,
    getAtomPermissionComputedChanges,
    getAtomPermissionOptions
} from "../../src/page/permission";

import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { getPageText } from "../../src/page/declare";
import { UserBox } from "../../component/view/avator/user";
import { S } from "../../i18n/view";
import { lst } from "../../i18n/store";
import { Tip } from "../../component/view/tooltip/tip";
import { ElementType } from "../../net/element.type";
import { TableSchemaView } from "../../blocks/data-grid/schema/meta";

class PagePublish extends EventsComponent {
    constructor(props) {
        super(props);
    }
    open(page: Page) {
        this.page = page;
        this.forceUpdate()
    }
    page: Page;
    copyLink() {
        CopyText(this.page.pageUrl);
        ShyAlert(lst('页面访问链接已复制'));
    }
    render() {
        var pr = this.page ? this.page?.getPermissions() : undefined;
        var view: TableSchemaView;
        if (this.page && this.page?.pe?.type == ElementType.SchemaRecordView) {
            view = this.page.schema.recordViews.find(g => g.id == this.page.pe.id1);
            if (view) {
                pr = {
                    share: view.share,
                    memberPermissions: view.memberPermissions,
                    netPermissions: view.netPermissions,
                    inviteUsersPermissions: view.inviteUsersPermissions
                }
            }
        }
        var self = this;
        var ps: {
            roleId?: string;
            userid?: string;
            permissions: AtomPermission[];
        }[] = pr?.memberPermissions || [];
        if (ps.length == 0) {
            ps.push(
                {
                    roleId: 'all',
                    permissions: [AtomPermission.docComment]
                }
            )
        }
        async function setGlobalShare(data) {
            if (view) {
                await self.page.schema.onSchemaOperate([{ name: 'updateSchemaView', id: view.id, data }])
            }
            else {
                await self.page.onUpdatePermissions(data);
            }
            self.forceUpdate()
        }
        async function addPermission(event: React.MouseEvent) {
            var rs = self.page.ws;
            var r = await useSelectMenuItem({ roundPoint: Point.from(event) },
                [
                    {
                        text: lst('添加角色'),
                        type: MenuItemType.text
                    },
                    {
                        text: lst('所有人'),
                        name: "addRole",
                        value: 'all',
                        disabled: (pr?.memberPermissions || []).some(s => s.roleId == 'all')
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
                            disabled: (pr?.memberPermissions || []).some(s => s.roleId == r.id)
                        }
                    })
                ]
            );
            if (r) {
                if (r.item.name == 'addMember') {

                }
                else if (r.item.name == 'addRole') {
                    if (!Array.isArray(pr.memberPermissions)) pr.memberPermissions = [];
                    pr.memberPermissions.push({
                        roleId: r.item.value,
                        permissions: [AtomPermission.docComment]
                    });
                    await setGlobalShare({ 'memberPermissions': pr.memberPermissions });
                }
            }
        }
        async function remove(mp) {
            lodash.remove(ps, p => p.userid && p.userid == mp.userid || p.roleId && p.roleId == mp.roleId);
            await setGlobalShare({ 'memberPermissions': ps });
        }
        function getRoles(roleId) {
            if (roleId == 'all') return lst('所有人')
            return self.page.ws.roles.find(g => g.id == roleId)?.text
        }
        if (!pr) return <div className='w-300 min-h-60'></div>
        var cp = this.page.currentPermissions;
        var as = getAtomPermissionOptions(this.page.pageLayout.type);
        return <div className='w-300 min-h-60 padding-t-10 round f-14'>
            <div className="flex  padding-w-14 ">
                <div className="flex-auto">
                    <UserBox userid={this.page.user.id}>{(user) => {
                        return <div className="flex flex-top">
                            <Avatar className="flex-fixed gap-r-10" size={32} user={user}></Avatar>
                            <div className="flex-auto">
                                <div>{user.name}</div>
                                <span className="gap remark f-12">
                                    {cp.item && <span className="flex-inline flex-center"><S>权限继承</S><span className="item-hover-focus padding-w-5 round cursor padding-h-2">{getPageText(cp.item)}</span></span>}
                                    {cp.isOwner && <span><S>权限继承空间管理员</S></span>}
                                    {cp.isWs && <span><S>权限继承所有人</S></span>}
                                </span>
                            </div>
                        </div>
                    }}</UserBox>
                </div>
                <div className="flex-fixed f-12 remark">
                    {cp.isOwner && <span className="item-hover-focus round padding-w-3 padding-h-2 cursor ">{"所有权"}</span>}
                    {cp.isWs && <span className="item-hover-focus round padding-w-3 padding-h-2  cursor ">{cp.permissions.map(p => {
                        return as.find(a => a.value == p)?.text
                    }).filter(g => g ? true : false).join(",")}</span>}
                    {Array.isArray(cp.netPermissions) && cp.netPermissions.length > 0 && <span className="item-hover-focus round padding-w-3  padding-h-2  cursor">{cp.netPermissions.map(p => {
                        return as.find(a => a.value == p)?.text
                    }).filter(g => g ? true : false).join(",")}</span>}
                    {Array.isArray(cp.memberPermissions) && cp.memberPermissions.length > 0 && <span className="item-hover-focus round padding-w-3 padding-h-2  cursor">{cp.memberPermissions.map(c => {
                        return c.permissions.map(p => {
                            return as.find(a => a.value == p)?.text
                        })
                    }).flat(4).filter(g => g ? true : false).join(",")}</span>}
                </div>
            </div>
            {
                this.page.isCanManage && <>
                    <Divider></Divider>
                    <div className="flex  padding-w-14">
                        <span className="flex-auto f-14 flex"><Icon size={16} className={'gap-r-5'} icon={{ name: 'bytedance-icon', code: 'user' }}></Icon><S>空间成员</S></span>
                        {this.page.isCanManage && <Tip text='添加成员权限'><span onMouseDown={e => addPermission(e)} className="flex-fixed flex-center size-20 item-hover round cursor"><Icon size={16} icon={PlusSvg}></Icon></span></Tip>}
                    </div>
                    <div>
                        {ps.map((mp, id) => {
                            return <div className="flex flex-top gap-h-10 padding-h-5 padding-w-14 item-hover round" key={id}>
                                <div className="flex-fixed">
                                    {mp.userid && <Avatar size={30} userid={mp.userid}></Avatar>}
                                    {mp.roleId && <span>{getRoles(mp.roleId)}</span>}
                                </div>
                                <div className="flex-auto flex flex-end">
                                    <div className="flex-fixed gap-r-5 flex-end f-12">
                                        <SelectBox
                                            small
                                            dropWidth={120}
                                            multiple
                                            computedChanges={async (vs, v) => {
                                                return getAtomPermissionComputedChanges(this.page.pageLayout.type, vs, v);
                                            }}
                                            options={getAtomPermissionOptions(this.page.pageLayout.type)}
                                            value={mp.permissions || []}
                                            onChange={async e => {
                                                if (!Array.isArray(mp.permissions)) {
                                                    if (ps.length == 1) {
                                                        ps = [{ roleId: 'all', permissions: e }]
                                                    }
                                                }
                                                else mp.permissions = e;
                                                await setGlobalShare({ 'memberPermissions': ps })
                                            }}
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
                            <Icon size={16} icon={GlobalLinkSvg}></Icon>
                            <span className="gap-l-5"><S>公开至互联网</S></span>
                        </span>
                        <span className="flex-fixed">
                            <Switch checked={pr?.share == 'net' ? true : false} onChange={e => setGlobalShare({ share: e ? "net" : 'nas' })}></Switch>
                        </span>
                    </div>
                    {pr.share == 'net' && <>
                        <div className="flex item-hover h-30 flex padding-w-14">
                            <div className="flex-auto text-overflow">
                                <S>页面公开访问权限</S>
                            </div>
                            <div className="flex-fixed f-12">
                                <SelectBox
                                    small
                                    // border
                                    multiple
                                    computedChanges={async (vs, v) => {
                                        return getAtomPermissionComputedChanges(this.page.pageLayout.type, vs, v);
                                    }}
                                    options={getAtomPermissionOptions(this.page.pageLayout.type)}
                                    value={pr.netPermissions || []}
                                    onChange={e => { setGlobalShare({ 'netPermissions': e }) }}
                                ></SelectBox>
                            </div>
                        </div>
                    </>}
                </>
            }
            <Divider></Divider>
            <div className="item-hover h-30  cursor  padding-w-14 flex"
                onClick={e => this.copyLink()}>
                <Icon size={18} icon={{ name: 'bytedance-icon', code: 'copy-link' }}></Icon><span className="gap-l-5"><S>复制页面访问链接</S></span>
            </div>
        </div>
    }
}

export async function usePagePublish(pos: PopoverPosition, page: Page) {
    let popover = await PopoverSingleton(PagePublish, { mask: true });
    let pagePublish = await popover.open(pos);
    pagePublish.open(page);
    return new Promise((resolve: (data: any) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        });
    })
}