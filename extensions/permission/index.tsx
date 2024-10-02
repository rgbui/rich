import lodash from "lodash";
import React from "react";
import { CopyText } from "../../component/copy";
import { ShyAlert } from "../../component/lib/alert";
import { EventsComponent } from "../../component/lib/events.component";
import { CheckSvg, CloseSvg, GlobalLinkSvg, PlusSvg } from "../../component/svgs";
import { Avatar } from "../../component/view/avator/face";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItemType } from "../../component/view/menu/declare";
import { SelectBox } from "../../component/view/select/box";
import { Switch } from "../../component/view/switch";
import { Rect } from "../../src/common/vector/point";
import { Page } from "../../src/page";

import {
    AtomPermission,
    getAllPermissionOptions,
    getAtomPermissionComputedChanges,
    getAtomPermissionOptions
} from "../../src/page/permission";

import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { PageLayoutType, getPageText } from "../../src/page/declare";
import { UserBox } from "../../component/view/avator/user";
import { S } from "../../i18n/view";
import { lst } from "../../i18n/store";
import { Tip } from "../../component/view/tooltip/tip";
import { HelpText } from "../../component/view/text";
import { ElementType } from "../../net/element.type";

class PagePermission extends EventsComponent {
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
        var self = this;
        var ps: {
            roleId?: string;
            permissions: AtomPermission[];
        }[] = pr?.memberPermissions || [];
        async function setGlobalShare(data) {
            await self.page.onUpdatePermissions(data);
            self.forceUpdate()
        }
        async function addPermission(event: React.MouseEvent) {
            var rs = self.page.ws;
            var r = await useSelectMenuItem({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) },
                [
                    {
                        text: lst('添加角色'),
                        type: MenuItemType.text
                    },
                    {
                        text: lst('@所有人', '@  所有人'),
                        name: "addRole",
                        value: 'all',
                        checkLabel: Array.isArray(pr.memberPermissions) && pr.memberPermissions.some(s => s.roleId == 'all')
                    },
                    ...rs.roles.map(r => {
                        return {
                            text: r.text,
                            name: 'addRole',
                            value: r.id,
                            type: MenuItemType.custom,
                            render(item, view) {
                                return <div className='gap-w-5 h-28 flex item-hover cursor padding-w-5 round'>
                                    <span className='flex-fixed size-12 gap-l-4 circle' style={{ background: r.color }}></span>
                                    <span className='flex-fixed gap-l-5'>{r.text}</span>
                                    {Array.isArray(pr.memberPermissions) && pr.memberPermissions.some(s => s.roleId == r.id) && <label className='flex-auto flex-end'><Icon className={'gap-r-8'} size={16} icon={CheckSvg}></Icon></label>}
                                </div>
                            }
                        }
                    })
                ]
            );
            if (r) {
                if (r.item.name == 'addMember') {

                }
                else if (r.item.name == 'addRole') {
                    if (!Array.isArray(pr.memberPermissions)) pr.memberPermissions = [];
                    if (pr.memberPermissions.some(s => s.roleId == r.item.value)) return;
                    if (self.page.pageLayout?.type == PageLayoutType.db)
                        pr.memberPermissions.push({
                            roleId: r.item.value,
                            permissions: [AtomPermission.dbEditRow]
                        });
                    else
                        pr.memberPermissions.push({
                            roleId: r.item.value,
                            permissions: [AtomPermission.pageView]
                        });
                    await setGlobalShare({ memberPermissions: pr.memberPermissions });
                }
            }
        }
        async function remove(mp) {
            lodash.remove(pr.memberPermissions as any[], p => p.roleId && p.roleId == mp.roleId);
            await setGlobalShare({ memberPermissions: pr.memberPermissions });
        }
        function getRoles(roleId) {
            if (roleId == 'all') return lst('@所有人')
            var role = self.page.ws.roles.find(g => g.id == roleId)
            return <><span className="size-12 gap-r-5 circle"
                style={{ backgroundColor: role.color }}></span>
                <span>{role?.text}</span>
            </>
        }
        if (!pr) return <div className='w-400 min-h-60'></div>
        var cp = this.page.currentPermissions;
        var permissonOptions = getAllPermissionOptions();
        var permissonType: "page" | "db" = 'page';
        if (this.page.pageLayout.type == PageLayoutType.db) {
            permissonType = 'db';
        }
        else if (this.page.pe.type == ElementType.SchemaRecordView || this.page.pe.type == ElementType.SchemaData || this.page.pe.type == ElementType.SchemaRecordViewData) {
            permissonType = 'db';
        }
        var isAllowCopy = true;
        if (this.page.pe.type == ElementType.SchemaRecordView || this.page.pe.type == ElementType.SchemaData || this.page.pe.type == ElementType.SchemaRecordViewData) {
            isAllowCopy = false;
        }
        function showPermissonsSource() {
            if (cp.source == 'wsOwner') return <span><S>权限继承超级管理员</S></span>
            if (cp.source == 'wsAllUser') return <span><S>权限继承空间所有人</S></span>
            if (cp.source == 'pageItem' && (cp as any).data.id != self.page.pageInfo?.id) return <span className="flex-inline flex-center"><S>权限继承</S><span className="item-hover-focus gap-w-5  gap-l-3  padding-w-5 round cursor ">{getPageText((cp as any).data)}</span></span>
            if (cp.source == 'pageItem' && (cp as any).data.id == self.page.pageInfo?.id) return <span><S>权限来源于当前页面</S></span>
            if (cp.source == 'SchemaData') return <span><S>权限来源于数据</S></span>
            if (cp.source == 'SchemaRecordView') return <span className="flex-inline flex-center"><S>权限来源于数据模板</S><span className="item-hover-focus padding-w-5 gap-l-3 round cursor ">{(cp as any).data.text}</span></span>
            if (cp.source == 'wsRole') return <span><S>权限继承角色&nbsp;</S>{cp.data.map(c => c.text).join(",")}</span>
            if (cp.source == 'workspacePublicAccess') return <span><S>权限来源于空间公开互联网</S></span>
        }
        var myPermissonText = '';
        if (Array.isArray(cp?.permissions) && cp.permissions.length > 0) {
            var nss = cp.permissions.map(p => {
                if (AtomPermission[p]?.startsWith('ws')) return ''
                if (!AtomPermission[p]) return '';
                if (AtomPermission[p].startsWith(permissonType)) {
                    return permissonOptions.find(a => a.value == p)?.text
                }
                return '';
            });
            myPermissonText = lodash.uniq(nss.filter(g => g ? true : false)).join(",")
        }

        return <div className='w-400 min-h-60 padding-t-10 round f-14'>
            <div className="flex round gap-w-5 padding-w-5 ">
                <div className="flex-auto">
                    <UserBox userid={this.page.user.id}>{(user) => {
                        return <div className="flex">
                            <Avatar className="flex-fixed gap-r-10" size={36} user={user}></Avatar>
                            <div className="flex-auto">
                                <div className="h-20 l-20">{user.name}</div>
                                <span className="remark f-12 l-20">
                                    {showPermissonsSource()}
                                </span>
                            </div>
                        </div>
                    }}</UserBox>
                </div>
                <div className="flex-fixed f-12 remark">
                    {cp.source == 'wsOwner' && <span className="item-hover-focus round padding-w-3 padding-h-2 cursor "><S>所有权限</S></span>}
                    {cp.source !== 'wsOwner' && myPermissonText && <span className="item-hover-focus round padding-w-3 padding-h-2  cursor ">{myPermissonText}</span>}
                </div>
            </div>
            {
                this.page.isCanManage && <>
                    <Divider></Divider>
                    <div className="flex  round gap-w-5 padding-w-5 ">
                        <span className="flex-auto f-14 flex remark"><Icon size={14} className={'gap-r-3'} icon={{ name: 'bytedance-icon', code: 'user' }}></Icon><S>成员角色</S></span>
                        {this.page.isCanManage && <Tip text='添加成员角色权限'><span onMouseDown={e => addPermission(e)} className="flex-fixed flex-center size-20 item-hover round cursor"><Icon size={16} icon={PlusSvg}></Icon></span></Tip>}
                    </div>
                    <div>
                        {ps.map((mp, id) => {
                            return <div className="flex item-hover gap-5 min-h-28 padding-w-5   padding-h-5  round" key={id}>
                                <div className="flex-fixed flex">
                                    {mp.roleId && getRoles(mp.roleId)}
                                </div>
                                <div className="flex-auto flex flex-end">
                                    <div className="flex-fixed gap-r-5 flex-end f-12">
                                        <SelectBox
                                            dropWidth={150}
                                            multiple
                                            border
                                            computedChanges={async (vs, v) => {
                                                return getAtomPermissionComputedChanges(permissonType, vs, v);
                                            }}
                                            options={getAtomPermissionOptions(permissonType)}
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
                                    <span
                                        onMouseDown={e => remove(mp)}
                                        className="flex-fixed flex-center size-20 remark  round item-hover cursor"><Icon
                                            size={12} icon={CloseSvg}></Icon>
                                    </span>
                                </div>
                            </div>
                        })}
                    </div>
                    <Divider></Divider>
                    <div className={"item-hover h-28 round flex gap-w-5 padding-w-5" + (pr.share == 'net' ? " gap-b-5 " : "")}>
                        <span className="flex-auto flex">
                            <Icon className={'text-1'} size={16} icon={GlobalLinkSvg}></Icon>
                            <span className="gap-l-5"><S>公开至互联网</S></span>
                        </span>
                        <span className="flex-fixed">
                            <Switch checked={pr?.share == 'net' ? true : false} onChange={e => {
                                var props = { share: e ? "net" : 'nas' } as any;
                                if (e) {
                                    if (!pr.netPermissions) {
                                        if (this.page.pageLayout?.type == PageLayoutType.db) {
                                            props.netPermissions = [AtomPermission.dbView]
                                        }
                                        else props.netPermissions = [AtomPermission.pageView]
                                    }
                                }
                                setGlobalShare(props)
                            }}></Switch>
                        </span>
                    </div>
                    {pr.share == 'net' && <>
                        <div className="flex item-hover gap-5 min-h-28 padding-w-5   padding-h-5  round">
                            <div className="flex-auto text-overflow">
                                <S>页面公开访问</S>
                            </div>
                            <div className="flex-fixed f-12">
                                <SelectBox
                                    border
                                    options={getAtomPermissionOptions(permissonType).slice(1, -1)}
                                    value={pr.netPermissions[0] || getAtomPermissionOptions(permissonType).slice(1, -1)[0]}
                                    onChange={e => { setGlobalShare({ 'netPermissions': [e] }) }}
                                ></SelectBox>
                            </div>
                        </div>
                        {isAllowCopy && <div className="flex item-hover gap-5 min-h-28 padding-w-5   padding-h-5  round">
                            <div className="flex-auto text-overflow">
                                <S>允许复制拷贝</S>
                            </div>
                            <div className="flex-fixed f-12">
                                <Switch checked={pr.netCopy ? true : false} onChange={e => {
                                    var props = { netCopy: e } as any;
                                    setGlobalShare(props)
                                }}></Switch>
                            </div>
                        </div>}
                    </>}
                </>
            }
            <Divider></Divider>
            <div className="item-hover h-28 cursor round gap-w-5 padding-w-5 flex "
                onClick={e => this.copyLink()}>
                <Icon className={'text-1'} size={16} icon={{ name: 'bytedance-icon', code: 'copy-link' }}></Icon><span className="gap-l-5"><S>复制页面访问链接</S></span>
            </div>
            <Divider></Divider>
            <div className="h-28 gap-w-5 padding-w-5 flex gap-b-5">
                <HelpText url={window.shyConfig?.isUS ? "https://help.shy.red/page/56#hGhhfbuoABYdi2teyAV39s" : "https://help.shy.live/page/348#f5wKC2CQ6jwJCsekNy6qZr"}><S>了解如何设置页面权限</S></HelpText>
            </div>
        </div>
    }
}

export async function usePagePermission(pos: PopoverPosition, page: Page) {
    let popover = await PopoverSingleton(PagePermission, { mask: true });
    let pagePublish = await popover.open(pos);
    pagePublish.open(page);
    return new Promise((resolve: (data: any) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        });
    })
}