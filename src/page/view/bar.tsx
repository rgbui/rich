import React from "react";
import { Page } from "..";
import { ChevronLeftSvg, ChevronRightSvg, CollectTableSvg, DotsSvg, DoubleRightSvg, FieldsSvg, MemberSvg, MenuSvg, PageSvg, PublishSvg, SearchSvg } from "../../../component/svgs";
import { UserAvatars } from "../../../component/view/avator/users";
import { Button } from "../../../component/view/button";
import { Icon } from "../../../component/view/icon";
import { Spin } from "../../../component/view/spin";
import { getPageIcon, getPageText } from "../../../extensions/at/declare";
import { useSearchBox } from "../../../extensions/search";
import { channel } from "../../../net/channel";
import { ElementType } from "../../../net/element.type";
import { PageLayoutType } from "../declare";
import { PageDirective } from "../directive";
import { isMobileOnly } from "react-device-detect";
import { Avatar } from "../../../component/view/avator/face";

export class PageBar extends React.Component<{ page: Page }>{
    renderTitle() {
        if (this.props.page.pe.type == ElementType.SchemaRecordViewData) {
            return <div className="flex-auto flex">
                {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onClose()} className="item-hover size-24 round cursor flex-center gap-l-10"><Icon size={18} icon={DoubleRightSvg}></Icon></span>}
                {/* <span onMouseDown={e => this.props.page.openSource != 'page' && this.props.page.onClose()} className="item-hover round flex  cursor padding-h-3 padding-w-5 ">
                    <Icon size={18} icon={getPageIcon(this.props.page?.schema?.icon, CollectTableSvg)}></Icon>
                    <span className="gap-l-5">{this.props.page?.schema?.text}</span>
                </span>
                <span className="flex-center"><Icon size={18} icon={ChevronRightSvg}></Icon></span> */}
                <span className="item-hover round flex cursor padding-h-3 padding-w-5 ">
                    <Icon size={20} icon={this.props.page?.formRowData?.icon || PageSvg}></Icon>
                    <span className="gap-l-5">{this.props.page?.formRowData?.title}</span>
                </span>
                {this.saving && <Spin></Spin>}
            </div>
        }
        return <div className="flex-auto flex">
            {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onClose()} className="item-hover size-24 round cursor flex-center gap-l-10"><Icon size={18} icon={DoubleRightSvg}></Icon></span>}
            <span className="item-hover round flex gap-l-10 cursor padding-h-3 padding-w-5 ">
                <Icon size={20} icon={getPageIcon(this.props.page?.pageInfo)}></Icon>
                <span className="gap-l-5">{getPageText(this.props.page?.pageInfo)}</span>
            </span>
            {this.saving && <Spin></Spin>}
        </div>
    }
    componentDidMount(): void {
        this.props.page.on(PageDirective.willSave, this.willSave);
        this.props.page.on(PageDirective.saved, this.saved);
        channel.sync('/user/view/onlines', this.syncUsers);
        var r = channel.query('/user/get/view/onlines', { viewId: this.props.page?.pageInfo?.id })
        if (r?.users && r.users.size > 0) {
            this.users = r.users;
            this.forceUpdate();
        }
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
    users = new Set<string>();
    syncUsers = (e: { viewId: string, users: Set<string> }) => {
        if (e.viewId == this.props.page?.pageInfo?.id) {
            this.users = e.users;
            this.forceUpdate();
        }
    }
    renderUsers() {
        if (this.props.page.openSource == 'snap') return <></>
        if ([PageLayoutType.textChannel].includes(this.props.page.pageLayout?.type)) return <></>
        return <div className="gap-r-10">
            <UserAvatars users={this.users}></UserAvatars>
        </div>
    }
    toLogin() {
        location.href = 'https://shy.live/sign/in';
    }
    renderPropertys() {
        if (this.props.page.openSource == 'snap') return <></>
        var isCanEdit = this.props.page.isCanEdit;
        var user = channel.query('/query/current/user');
        var ws = channel.query('/current/workspace')
        var isSign = user.id ? true : false;
        var isField: boolean = false;
        var isMember: boolean = false;
        var isSearch: boolean = false;
        var isPublish: boolean = false;
        var isContextMenu: boolean = false;
        if ([PageLayoutType.dbForm].includes(this.props.page.pageLayout?.type)) {
            isField = true;
            if (!isCanEdit) isField = false;
        }
        if ([PageLayoutType.textChannel].includes(this.props.page.pageLayout?.type)) {
            isMember = true;
            if (!isCanEdit) isMember = false;
        }
        if (![
            PageLayoutType.textChannel,
            PageLayoutType.dbForm,
            PageLayoutType.db,
            PageLayoutType.board].includes(this.props.page.pageLayout?.type)) {
            isSearch = true;
            if (!isCanEdit) isSearch = false;
        }
        if (![PageLayoutType.textChannel].includes(this.props.page.pageLayout?.type)) {
            isPublish = true;
            if (!isCanEdit) isPublish = false;
        }
        if (![PageLayoutType.textChannel].includes(this.props.page.pageLayout?.type)) {
            isContextMenu = true;
            if (!isCanEdit) isContextMenu = false;
        }
        if (isSign) return <div className="flex r-flex-center r-size-24 r-item-hover r-round r-cursor r-gap-r-10 text-1">
            {isField && <span onMouseDown={e => this.props.page.onOpenFieldProperty(e)} ><Icon size={18} icon={FieldsSvg}></Icon></span>}
            {isMember && <span onMouseDown={e => this.props.page.openMember(e)} ><Icon size={18} icon={MemberSvg}></Icon></span>}
            {isSearch && <span onMouseDown={async e => { await useSearchBox({ isNav: true }) }}><Icon size={18} icon={SearchSvg}></Icon></span>}
            {isPublish && <span onMouseDown={e => this.props.page.onOpenPublish(e)} ><Icon size={18} icon={PublishSvg}></Icon></span>}
            {isContextMenu && <span onMouseDown={e => this.props.page.onPageContextmenu(e)} ><Icon size={18} icon={DotsSvg}></Icon></span>}
            {!isCanEdit && ws.access == 0 && !ws.isMember && <span className="size-30 gap-r-30"><Avatar size={32} userid={user.id}></Avatar></span>}
        </div>
        else return <div className="flex r-flex-center  r-gap-r-10 ">
            <Button size="small" onClick={e => this.toLogin()}>登录</Button>
        </div>
    }
    onSpreadMenu() {
        this.props.page.emit(PageDirective.spreadSln)
    }
    render(): React.ReactNode {
        return <div className="shy-page-bar flex padding-l-10">
            {isMobileOnly && <span onClick={e => this.onSpreadMenu()} className="flex-fixed size-24 flex-center item-hover round cursor ">
                <Icon icon={ChevronLeftSvg} size={18}></Icon>
            </span>}
            {this.renderTitle()}
            <div className="flex-fixed flex">{this.renderUsers()}{this.renderPropertys()}</div>
        </div>
    }
}