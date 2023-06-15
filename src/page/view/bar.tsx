import React, { CSSProperties } from "react";
import { Page } from "..";
import {
    ChevronLeftSvg,
    ChevronRightSvg,
    CollectTableSvg,
    DetailSvg,
    DotsSvg,
    DoubleRightSvg,
    EditSvg,
    FieldsSvg,
    MemberSvg,
    OrderSvg,
    PageSvg,
    PublishSvg,
    SearchSvg,
    TableSvg
} from "../../../component/svgs";
import { UserAvatars } from "../../../component/view/avator/users";
import { Button } from "../../../component/view/button";
import { Icon } from "../../../component/view/icon";
import { Spin } from "../../../component/view/spin";
import { channel } from "../../../net/channel";
import { ElementType } from "../../../net/element.type";
import { PageLayoutType, getPageIcon, getPageText } from "../declare";
import { PageDirective } from "../directive";
import { isMobileOnly } from "react-device-detect";
import { Avatar } from "../../../component/view/avator/face";
import { ToolTip } from "../../../component/view/tooltip";
import { useWsSearch } from "../../../extensions/search";

export class PageBar extends React.Component<{ page: Page }>{
    renderTitle() {
        if ([ElementType.SchemaData, ElementType.SchemaRecordView, ElementType.SchemaView].includes(this.props.page.pe.type) && !this.props.page.isSchemaRecordViewTemplate) {
            return <div className="flex-auto flex">
                {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onClose()} className="item-hover size-24 round cursor flex-center gap-l-10"><Icon size={18} icon={DoubleRightSvg}></Icon></span>}
                <span onMouseDown={e => this.props.page.onBack()} className="item-hover round flex cursor padding-h-3 padding-w-5">
                    <Icon size={20} icon={this.props.page.schema?.icon || CollectTableSvg}></Icon>
                    <span className="gap-l-5">{this.props.page.schema?.text}</span>
                </span>
                <span className="flex-center"><Icon icon={ChevronRightSvg} size={18}></Icon></span>
                <span className="item-hover round flex cursor padding-h-3 padding-w-5">
                    <Icon size={20} icon={this.props.page?.formRowData?.icon || PageSvg}></Icon>
                    <span className="gap-l-5">{this.props.page?.formRowData?.title || '新页面'}</span>
                </span>
                {this.saving && <Spin></Spin>}
            </div>
        }
        else if (this.props.page.isSchemaRecordViewTemplate) {
            var sv = this.props.page.schema.views.find(g => g.id == this.props.page.pe.id1);
            return <div className="flex-auto flex">
                {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onClose()} className="item-hover size-24 round cursor flex-center gap-l-10"><Icon size={18} icon={DoubleRightSvg}></Icon></span>}
                <span onMouseDown={e => this.props.page.onBack()} className="item-hover round flex cursor padding-h-3 padding-w-5">
                    <Icon size={20} icon={this.props.page.schema?.icon || CollectTableSvg}></Icon>
                    <span className="gap-l-5">{this.props.page.schema?.text}</span>
                </span>
                <span className="flex-center"><Icon icon={ChevronRightSvg} size={18}></Icon></span>
                <span className="item-hover round flex gap-l-10 cursor padding-h-3 padding-w-5">
                    <Icon size={20} icon={sv?.icon || PageSvg}></Icon>
                    <span className="gap-l-5">{sv?.text || ''}</span>
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
            {this.props.page.pageInfo?.isCanEdit && <>
                {!this.props.page.canEdit && <ToolTip ref={e => this.be = e} placement="bottom" overlay={'进入编辑'}><span className="flex flex-fixed visible r-gap-l-5 text-1 cursor " onClick={e => {
                    if (this.be) this.be.close()
                    this.props.page.onChangeEditMode()
                }}><Icon size={18} icon={EditSvg}></Icon></span></ToolTip>}
            </>}
            {this.saving && <Spin></Spin>}
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
            viewUrl: this.props.page.customElementUrl
        })
        if (r?.users && r.users.size > 0) {
            this.users = r.users;
            this.forceUpdate();
        } else this.users = new Set()
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
    syncUsers = (e: { viewUrl: string, users: Set<string>, editUsers: Set<string> }) => {
        if (e.viewUrl == this.props.page.customElementUrl) {
            this.users = this.props.page.isCanEdit ? e.editUsers : e.users;
            this.forceUpdate();
        }
    }
    renderUsers() {

        if (this.props.page.openSource == 'snap') return <></>
        if ([PageLayoutType.textChannel].includes(this.props.page.pageLayout?.type)) return <></>
        var user = channel.query('/query/current/user');
        return <div className="gap-r-10">
            {this.users.size > 1 || this.users.size == 1 && user?.id && !this.users.has(user?.id) && <UserAvatars size={30} users={this.users}></UserAvatars>}
        </div>
    }
    toLogin() {
        location.href = 'https://shy.live/sign/in';
    }
    renderPropertys() {
        if (this.props.page.openSource == 'snap') return <></>
        var isCanEdit = this.props.page.pageInfo?.isCanEdit;
        var user = channel.query('/query/current/user');
        var ws = channel.query('/current/workspace')
        var isSign = user?.id ? true : false;
        var isField: boolean = false;
        var isMember: boolean = false;
        var isSearch: boolean = false;
        var isPublish: boolean = false;
        var isContextMenu: boolean = false;

        var isSchemR = [ElementType.SchemaData, ElementType.SchemaRecordView].includes(this.props.page.pe.type)
        if (isSchemR) {
            isCanEdit = true;
        }
        if (this.props.page.pe.type == ElementType.SchemaData || this.props.page.pe.type == ElementType.SchemaRecordView) {
            isField = true;
            if (!isCanEdit) isField = false;
        }
        if ([PageLayoutType.textChannel].includes(this.props.page.pageLayout?.type)) {
            isMember = true;
            if (!isCanEdit) isMember = false;
        }
        if (![
            PageLayoutType.textChannel,
            PageLayoutType.formView,
            PageLayoutType.db,
            PageLayoutType.board].includes(this.props.page.pageLayout?.type)) {
            isSearch = true;
            if (!isCanEdit) isSearch = false;
        }
        if (![PageLayoutType.textChannel].includes(this.props.page.pageLayout?.type)) {
            isPublish = true;
            if (!isCanEdit) isPublish = false;
            if (isSchemR) isPublish = false;
        }
        if (![PageLayoutType.textChannel].includes(this.props.page.pageLayout?.type)) {
            isContextMenu = true;
            if (!isCanEdit) isContextMenu = false;
        }
        if (isSign) return <div className="flex r-flex-center r-size-24 r-item-hover r-round r-cursor r-gap-r-10 text-1 gap-r-10">
            {isField && <span onMouseDown={e => this.props.page.onOpenFieldProperty(e)} ><Icon size={18} icon={FieldsSvg}></Icon></span>}
            {isMember && <span onMouseDown={e => this.props.page.openMember(e)} ><Icon size={18} icon={MemberSvg}></Icon></span>}
            {isSearch && <span onMouseDown={async e => { await useWsSearch() }}><Icon size={18} icon={SearchSvg}></Icon></span>}
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
        var isDocCard = this.props.page.pageLayout?.type == PageLayoutType.docCard;
        var style: CSSProperties = {}
        if (isDocCard) {
            style.backdropFilter = `blur(20px) saturate(170%)`;
            style.backgroundColor = 'rgba(255, 252, 248, 0.75)';
        }
        return <div style={style} className="shy-page-bar flex padding-l-10 visible-hover">
            {isMobileOnly && <span onClick={e => this.onSpreadMenu()} className="flex-fixed size-24 flex-center item-hover round cursor ">
                <Icon icon={ChevronLeftSvg} size={18}></Icon>
            </span>}
            {this.renderTitle()}
            <div className="flex-fixed flex">{this.renderUsers()}{this.renderPropertys()}</div>
        </div>
    }
}