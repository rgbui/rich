import React, { CSSProperties } from "react";
import { Page } from "..";

import {
    ArrowZoomSvg,
    ChevronLeftSvg,
    ChevronRightSvg,
    DotsSvg,
    LockSvg,
    MemberSvg,
    PageSvg,
    PublishSvg,
    SearchSvg
} from "../../../component/svgs";

import { UserAvatars } from "../../../component/view/avator/users";
import { Button } from "../../../component/view/button";
import { Icon, IconValueType } from "../../../component/view/icon";
import { Loading2 } from "../../../component/view/spin";
import { channel } from "../../../net/channel";
import { ElementType } from "../../../net/element.type";
import { PageLayoutType, getPageIcon, getPageText } from "../declare";
import { PageDirective, PageLocation } from "../directive";
import { isMobileOnly } from "react-device-detect";
import { Avatar } from "../../../component/view/avator/face";
import { ToolTip } from "../../../component/view/tooltip";
import { DefinePageNavBar } from "./common";
import { S } from "../../../i18n/view";
import { lst } from "../../../i18n/store";
import { Tip } from "../../../component/view/tooltip/tip";
import { useSearchBox } from "../../../extensions/search/keyword";
import { useInputIconAndText } from "../../../component/view/input/iconAndText";
import { IconArguments } from "../../../extensions/icon/declare";
import { Rect } from "../../common/vector/point";
import { UA } from "../../../util/ua";
import { useSelectMenuItem } from "../../../component/view/menu";

export class PageBar extends React.Component<{ page: Page }> {
    preTip: Tip;
    nextTip: Tip;
    expendTip: Tip;
    async onRenamePage(event: React.MouseEvent, options: {
        text: string,
        icon: IconArguments,
        defaultIcon?: IconValueType
    }) {
        if (!this.props.page.isCanEdit) return;
        if (this.props.page.openSource !== 'page') return;
        var r = await useInputIconAndText({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, options);
        if (r) {
            await this.props.page.onUpdatePageData({ text: r.text || undefined, icon: r.icon }, PageLocation.pageBarUpdateInfo);
            this.forceUpdate();
        }
    }
    renderParents() {
        if (this.props.page.pageLayout?.type == PageLayoutType.textChannel) return <></>
        var rs = this.props.page.parentItems.filter(item => (item.mime == 20 || item.mime == 'pages') ? false : true);
        rs = rs.filter(g => g.id != this.props.page.pageInfo?.id ? true : false);
        if (rs.length == 0) return <></>
        var cs: any[] = rs;
        if (rs.length > 2) {
            cs = [rs[0], '...', rs[rs.length - 1]];
        }
        return <>
            {cs.map((g, i) => <span key={i} className="flex-fixed  flex">
                <span onMouseDown={async e => {
                    if (g == '...') {
                        var ds = rs.slice(1, rs.length - 1);
                        var us = await useSelectMenuItem({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) }, ds.map(d => {
                            return {
                                icon: getPageIcon(d),
                                text: getPageText(d),
                                value: d.id
                            }
                        }));
                        if (us?.item) {
                            channel.act('/page/open', { item: us.item.value })
                        }
                    }
                    else
                        channel.act('/page/open', { item: g.id })
                }} className={"flex-fixed desk-no-drag  item-hover flex round  cursor  " + (g == '...' ? "size-24 flex-center " : "padding-h-3 padding-w-5 ")}>
                    {g.icon && <Icon className={'gap-r-5'} size={18} icon={getPageIcon(g)}></Icon>}
                    <span className={g == '...' ? "" : "text-overflow max-w-120"}>{g == '...' ? "..." : getPageText(g)}</span>
                </span>
                <span className="gap-w-5 f-18 remark" style={{ display: 'inline-block' }}>/</span>
            </span>)}
        </>
    }
    renderTitle() {
        if ([ElementType.SchemaData, ElementType.SchemaRecordViewData].includes(this.props.page.pe.type)) {
            return <div className="flex-auto flex desk-drag">
                {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onPageClose()} className="desk-no-drag item-hover size-24 round cursor flex-center gap-r-10 "><Icon size={18} icon={{ name: 'byte', code: 'double-right' }}></Icon></span>}
                {(this.props.page.openSource == 'dialog' || this.props.page.openSource == 'slide') && <>
                    <Tip text='展开为整页' ref={e => this.expendTip = e}><span onMouseDown={e => { this.expendTip.close(); this.props.page.onPageViewTurn('page') }} className="desk-no-drag size-24   flex-center round item-hover cursor gap-r-10"><Icon size={15} icon={ArrowZoomSvg}></Icon></span></Tip>
                    <Tip ref={e => this.preTip = e} text='上一条'><span onMouseDown={e => { this.preTip.close(); this.props.page.onPageViewTurn('prev') }} className={"desk-no-drag size-24  flex-center round item-hover cursor gap-r-10" + (this.props.page.formPreRow ? " " : " remark")}><Icon icon={{ name: 'bytedance-icon', code: 'up' }} size={20} ></Icon></span></Tip>
                    <Tip ref={e => this.nextTip = e} text='下一条'><span onMouseDown={e => { this.nextTip.close(); this.props.page.onPageViewTurn('next') }} className={"desk-no-drag  size-24  flex-center round item-hover cursor gap-r-10" + (this.props.page.formNextRow ? " " : " remark")}><Icon icon={{ name: 'bytedance-icon', code: 'down' }} size={20} ></Icon></span></Tip></>
                }
                {this.props.page.openSource == 'page' && <>
                    {this.props.page?.openPageData?.pre && <><span onMouseDown={e => this.props.page.onPrev()} className="desk-no-drag item-hover round flex cursor padding-h-3 padding-w-5 ">
                        {this.props.page?.openPageData?.pre?.icon && <Icon size={18} icon={getPageIcon(this.props.page?.openPageData?.pre)}></Icon>}
                        <span className="gap-l-5">{getPageText(this.props.page?.openPageData?.pre)}</span>
                    </span>
                        <span className="flex-center desk-no-drag  gap-w-2 remark"><Icon icon={ChevronRightSvg} size={18}></Icon></span></>}
                    <span onMouseDown={e => this.onRenamePage(e, { text: this.props.page?.formRowData?.title, icon: this.props.page?.formRowData?.icon, defaultIcon: PageSvg })} className="desk-no-drag item-hover round flex cursor padding-h-3 padding-w-5 gap-r-10">
                        <Icon size={18} icon={this.props.page?.formRowData?.icon || PageSvg}></Icon>
                        <span className="gap-l-5">{this.props.page?.formRowData?.title || lst('新页面')}</span>
                    </span>
                </>}
                {this.saving && <span className="flex-center size-24"><Loading2 remark className={'op-7'} size={16}></Loading2></span>}
            </div>
        }
        else if ([ElementType.SchemaRecordView].includes(this.props.page.pe.type) && !this.props.page.isSchemaRecordViewTemplate) {
            return <div className="flex-auto flex desk-drag">
                {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onPageClose()} className="desk-no-drag item-hover  round cursor flex-center size-24  gap-r-10"><Icon size={18} icon={{ name: 'byte', code: 'double-right' }}></Icon></span>}
                {this.props.page.openSource == 'page' && this.props.page?.openPageData?.pre && <><span onMouseDown={e => this.props.page.onPrev()} className="desk-no-drag item-hover round flex cursor padding-h-3 padding-w-5 ">
                    {this.props.page?.openPageData?.pre?.icon && <Icon size={18} icon={getPageIcon(this.props.page?.openPageData?.pre)}></Icon>}
                    <span className="gap-l-5">{getPageText(this.props.page?.openPageData?.pre)}</span>
                </span>
                    <span className="flex-center desk-no-drag gap-w-2 remark"><Icon className={'text-1'} icon={ChevronRightSvg} size={18}></Icon></span></>
                }
                <span onMouseDown={e => { this.onRenamePage(e, { text: this.props.page?.formRowData?.title, icon: this.props.page?.formRowData?.icon, defaultIcon: { name: 'byte', code: 'table' } }) }} className="desk-no-drag item-hover round flex cursor padding-h-3 padding-w-5 gap-r-10">
                    <Icon size={18} icon={this.props.page?.formRowData?.icon || PageSvg}></Icon>
                    <span className="gap-l-5">{this.props.page?.formRowData?.title || lst('新页面')}</span>
                </span>
                {this.props.page.locker?.lock && this.props.page.isCanManage && <span onMouseDown={e => this.props.page.onLockPage()} className="desk-no-drag flex-center visible size-24 gap-r-10 item-hover cursor round gap-r-10">
                    <Icon size={18} icon={LockSvg}></Icon>
                </span>}
                {this.saving && <span className="flex-center size-24"><Loading2 remark className={'op-7'} size={16}></Loading2></span>}
            </div>
        }
        else if (this.props.page.isSchemaRecordViewTemplate) {
            var sv = this.props.page.schema.views.find(g => g.id == this.props.page.pe.id1);
            return <div className="flex-auto flex desk-drag">
                {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onPageClose()} className="desk-no-drag item-hover size-24 round cursor flex-center  gap-r-10"><Icon size={18} icon={{ name: 'byte', code: 'double-right' }}></Icon></span>}
                <span onMouseDown={e => { this.onRenamePage(e, { text: sv?.text, icon: sv?.icon, defaultIcon: { name: 'byte', code: 'table' } }) }} className="desk-no-drag item-hover round flex  cursor padding-h-3 padding-w-5 gap-r-10">
                    <Icon className={'text-1'} size={18} icon={sv?.icon || PageSvg}></Icon>
                    <span className="gap-l-5">{sv?.text || ''}</span>
                </span>
                {this.props.page.locker?.lock && this.props.page.isCanManage && <span onMouseDown={e => this.props.page.onLockPage()} className="desk-no-drag flex-center visible size-24 item-hover cursor round gap-r-10">
                    <Icon className={'text-1'} size={18} icon={LockSvg}></Icon>
                </span>}
                {this.saving && <span className="flex-center size-24"><Loading2 remark className={'op-7'} size={16}></Loading2></span>}
            </div>
        }
        return <div className="flex-auto flex desk-drag">
            {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onPageClose()}
                className="desk-no-drag item-hover size-24 round cursor flex-center  gap-r-10"><Icon size={18}
                    icon={{ name: 'byte', code: 'double-right' }}></Icon></span>}
            <span className=" round flex ">
                {this.renderParents()}
                <span onMouseDown={e => { this.onRenamePage(e, { text: this.props.page?.pageInfo.text, icon: this.props.page.pageInfo.icon, defaultIcon: getPageIcon({ pageType: this.props.page?.pageInfo?.pageType }) }) }} className="flex-fixed desk-no-drag  item-hover flex round  cursor padding-h-3 padding-w-5  gap-r-10">
                    {this.props.page?.pageInfo?.icon && <Icon size={18} icon={getPageIcon(this.props.page?.pageInfo)}></Icon>}
                    <span className={"text-overflow max-w-250 " + (this.props.page?.pageInfo?.icon ? "gap-l-5" : "")}>{getPageText(this.props.page?.pageInfo)}</span>
                </span>
                {this.props.page.pageLayout?.type == PageLayoutType.textChannel && <span className={"flex-auto remark text-overflow " + (isMobileOnly ? " max-w-250" : " max-w-500")}>{this.props.page?.pageInfo?.description?.text}</span>}
            </span>
            {this.props.page.locker?.lock && this.props.page.isCanManage && <span onMouseDown={e => this.props.page.onLockPage()} className="desk-no-drag flex-center size-24 item-hover cursor round gap-r-10">
                <Icon size={18} icon={LockSvg}></Icon>
            </span>}
            {this.saving && <span className="flex-center size-24"><Loading2 remark className={'op-7'} size={16}></Loading2></span>}
        </div>
    }
    be: ToolTip;
    componentDidMount(): void {
        this.props.page.on(PageDirective.willSave, this.willSave);
        this.props.page.on(PageDirective.saved, this.saved);
        channel.sync('/user/view/onlines', this.syncUsers);
        this.load()
    }
    async load() {
        var r = await channel.query('/get/view/onlines', {
            viewUrl: this.props.page.elementUrl
        })
        if (r?.users && r.users.size > 0) this.users = Array.from(r.users);
        else this.users = []
        this.forceUpdate();
    }
    componentWillUnmount(): void {
        this.props.page.off(PageDirective.willSave, this.willSave)
        this.props.page.off(PageDirective.save, this.saved);
        channel.off('/user/view/onlines', this.syncUsers);
    }
    saving: boolean = false;
    willSave = () => {
        this.saving = true;
        this.forceUpdate();
    }
    saved = () => {
        this.saving = false;
        this.forceUpdate();
    }
    users: string[] = [];
    syncUsers = (e: { viewUrl: string, users: Set<string> }) => {
        if (e.viewUrl == this.props.page.elementUrl) {
            this.users = Array.from(e.users);
            this.props.page.kit.collaboration.clearNotOnLineUser(this.users);
            this.forceUpdate();
        }
    }
    renderUsers() {
        if (this.props.page.openSource == 'snap') return <></>
        if ([PageLayoutType.textChannel].includes(this.props.page.pageLayout?.type)) return <></>
        if (this.props.page.user?.id && !this.users.some(g => g === this.props.page.user?.id)) {
            this.users.push(this.props.page.user?.id)
        }
        return <div className="gap-r-10">
            {(this.users.length > 1 || this.users.length == 1 && this.props.page.user?.id && this.users[0] != this.props.page.user?.id) && <UserAvatars
                hideStatus={true}
                limit={5} showName={false} size={30} users={this.users}></UserAvatars>}
        </div>
    }
    toLogin() {
        var back = location.href;
        if (window.shyConfig?.isDev) location.href = '/sign/in'
        else location.href = 'https://shy.live/sign/in?back='.replace('shy.live', window.shyConfig.isUS ? "shy.red" : "shy.live") + encodeURIComponent(back);
    }
    toHome() {
        if (window.shyConfig.isDev) location.href = '/home'
        else location.href = 'https://shy.live/home'.replace('shy.live', window.shyConfig.isUS ? "shy.red" : "shy.live")
    }
    renderPropertys() {
        if (this.props.page.openSource == 'snap') return <></>
        if (this.props.page?.ws?.accessWorkspace == 'embed') return <></>
        var user = this.props.page.user;
        if (this.props.page.ws.isPubSite) {
            if (this.props.page.isSign) return <div className="flex   gap-r-10">
                <span onClick={e => this.toHome()} className="size-40 gap-r-30 flex-center cursor"><Avatar size={32} userid={user.id}></Avatar></span>
            </div>
            else if (this.props.page.openSource == 'page') return <div className="flex r-flex-center  r-gap-r-10 ">
                <Button dark onClick={e => this.toLogin()}><S>登录/注册</S></Button>
            </div>
            else return <></>
        }
        var isCanEdit = this.props.page.isCanEdit;
        var ws = this.props.page.ws;
        var isField: boolean = false;
        var isMember: boolean = false;
        var isSearch: boolean = true;
        var isPublish: boolean = true;
        var isContextMenu: boolean = true;
        // var isAi: boolean = this.props.page.ws?.aiConfig?.aiSearch;
        if (!this.props.page.isSign) {
            isPublish = false;
        }
        if (this.props.page.openSource == 'slide' || this.props.page.openSource == 'dialog') {
            isSearch = false;
        }
        if (this.props.page.pe.type == ElementType.SchemaData) {
            isField = true;
            if (!isCanEdit) { isField = false; isPublish = false; }
            if (this.props.page.isSchemaRecordViewTemplate) isPublish = true;
            else isPublish = false;
        }
        if (this.props.page.pe.type == ElementType.SchemaRecordView) {
            isField = true;
            if (!isCanEdit) isField = false;
        }
        if ([PageLayoutType.textChannel].includes(this.props.page.pageLayout?.type)) {
            isMember = true;
        }
        if (this.props.page.isSign) return <div className="flex r-flex-center r-size-24 r-item-hover r-round r-cursor r-gap-l-10 text-1 gap-r-20">
            {isField && <Tip placement="bottom" text='页面字段设置'><span onMouseDown={e => this.props.page.onOpenFormMenu(e)} ><Icon size={18} icon={{ name: 'bytedance-icon', code: 'setting-one' }}></Icon></span></Tip>}
            {isMember && <Tip placement="bottom" text='在线成员'><span onMouseDown={e => this.props.page.onOpenMember(e)} ><Icon size={18} icon={MemberSvg}></Icon></span></Tip>}
            {isSearch && <Tip placement="bottom" text='空间搜索'><span onMouseDown={async e => { await useSearchBox({ ws: this.props.page.ws }) }}><Icon size={18} icon={SearchSvg}></Icon></span></Tip>}
            {/* {isAi && <span onMouseDown={async e => { await useAISearchBox({ ws: this.props.page.ws }) }}><Icon  size={18} icon={AiStartSvg}></Icon></span>} */}
            {isPublish && <Tip placement="bottom" text='页面权限协作与分享'><span onMouseDown={e => this.props.page.onOpenPublish(e)} ><Icon size={18} icon={PublishSvg}></Icon></span></Tip>}
            {isContextMenu && isCanEdit && <Tip placement="bottom" text='页面设置'><span onMouseDown={e => this.props.page.onPageContextmenu(e)} ><Icon size={18} icon={DotsSvg}></Icon></span></Tip>}
            {!isCanEdit && ws.access == 0 && !ws.isMember && <span className="size-30 gap-r-30"><Avatar size={32} userid={user.id}></Avatar></span>}
        </div>
        else if (this.props.page.openSource == 'page') return <div className="flex r-flex-center  r-gap-r-10 ">
            <Button dark onClick={e => this.toLogin()}><S>登录/注册</S></Button>
        </div>
        else return <></>
    }

    render(): React.ReactNode {
        if (this.props.page.bar === false) return <></>
        if (this.props.page.ws.isPubSite && this.props.page.ws.isPubSiteDefineBarMenu) return <></>
        var style: CSSProperties = { zIndex: 1 }
        return <div style={style} className={"shy-page-bar flex visible-hover relative " + (isMobileOnly ? "" : "padding-l-10")}>
            {isMobileOnly && <span onClick={e => this.props.page.onSpreadMenu()} className="flex-fixed size-24 flex-center item-hover round cursor ">
                <Icon icon={ChevronLeftSvg} size={18}></Icon>
            </span>}
            {!isMobileOnly && this.props.page.openSource == 'page' && !this.props.page.ws.isPubSiteHideMenu && this.props.page.ws.slnSpread == false && <ToolTip placement="bottom" overlay={<div>{lst('展开')}<br /><span style={{ color: '#aaa' }}>{UA.isMacOs ? "⌘+\\" : "Ctrl+\\"}</span></div>}><span onClick={e => {
                this.props.page.onSpreadMenu()
            }} className="flex-fixed size-24 flex-center item-hover round cursor ">
                <Icon icon={{ name: 'bytedance-icon', code: 'hamburger-button' }} size={18}></Icon>
            </span></ToolTip>}
            {this.renderTitle()}
            <div className="flex-fixed flex">{this.renderUsers()}{this.renderPropertys()}</div>
            {this.props.page.isSchemaRecordViewTemplate && <div className="pos-center padding-w-10 h-30 bg flex-center round f-12">
                <S>编辑模板</S><span>[{this.props.page.schema.views.find(c => c.id == this.props.page.pe.id1)?.text}]</span>
            </div>}
        </div>
    }
    renderDefineBar() {
        var style: CSSProperties = {
            marginLeft: 20,
            marginRight: 20
        }
        if (this.props.page.ws?.isPubSiteHideMenu) {
            style = this.props.page.getScreenStyle()
        }
        if (isMobileOnly) {
            style.marginLeft = 5;
            style.marginRight = 5;
        }
        return <DefinePageNavBar
            user={this.props.page.user}
            ws={this.props.page.ws}
            renderUser={this.renderUsers()}
            style={style}></DefinePageNavBar>
    }
}