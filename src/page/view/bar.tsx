import React, { CSSProperties } from "react";
import { Page } from "..";

import {
    AiStartSvg,
    ArrowZoomSvg,
    ChevronLeftSvg,
    ChevronRightSvg,
    CollectTableSvg,
    DotsSvg,
    DoubleRightSvg,
    LockSvg,
    MemberSvg,
    PageSvg,
    PublishSvg,
    SearchSvg
} from "../../../component/svgs";

import { UserAvatars } from "../../../component/view/avator/users";
import { Button } from "../../../component/view/button";
import { Icon } from "../../../component/view/icon";
import { Loading1, Spin } from "../../../component/view/spin";
import { channel } from "../../../net/channel";
import { ElementType } from "../../../net/element.type";
import { PageLayoutType, getPageIcon, getPageText } from "../declare";
import { PageDirective } from "../directive";
import { isMobileOnly } from "react-device-detect";
import { Avatar } from "../../../component/view/avator/face";
import { ToolTip } from "../../../component/view/tooltip";

import { DefinePageNavBar } from "./common";
import { S } from "../../../i18n/view";
import { lst } from "../../../i18n/store";
import { Tip } from "../../../component/view/tooltip/tip";
import { useAISearchBox } from "../../../extensions/search/ai";
import { useSearchBox } from "../../../extensions/search/keyword";

export class PageBar extends React.Component<{ page: Page }>{
    preTip: Tip;
    nextTip: Tip;
    expendTip: Tip;
    renderTitle() {
        if ([ElementType.SchemaData].includes(this.props.page.pe.type) && !this.props.page.isSchemaRecordViewTemplate) {
            return <div className="flex-auto flex desk-drag">
                {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onPageClose()} className="desk-no-drag item-hover size-24 round cursor flex-center "><Icon size={20} icon={DoubleRightSvg}></Icon></span>}
                {(this.props.page.openSource == 'dialog' || this.props.page.openSource == 'slide') && <> <Tip text='展开为整页' ref={e => this.expendTip = e}><span onMouseDown={e => { this.expendTip.close(); this.props.page.onFormOpen('page') }} className="desk-no-drag size-20 flex-center round item-hover cursor gap-r-5"><Icon size={16} icon={ArrowZoomSvg}></Icon></span></Tip>
                    <Tip ref={e => this.preTip = e} text='上一条'><span onMouseDown={e => { this.preTip.close(); this.props.page.onFormOpen('prev') }} className={"desk-no-drag  gap-r-5 size-20 flex-center round item-hover cursor" + (this.props.page.formPreRow ? "" : " remark")}><Icon icon={{ name: 'bytedance-icon', code: 'up' }} size={24} ></Icon></span></Tip>
                    <Tip ref={e => this.nextTip = e} text='下一条'><span onMouseDown={e => { this.nextTip.close(); this.props.page.onFormOpen('next') }} className={"desk-no-drag  gap-r-5 size-20 flex-center round item-hover cursor" + (this.props.page.formNextRow ? "" : " remark")}><Icon icon={{ name: 'bytedance-icon', code: 'down' }} size={24} ></Icon></span></Tip></>
                }
                {this.props.page.openSource == 'page' && <>
                    <span onMouseDown={e => this.props.page.onBack()} className="desk-no-drag item-hover round flex cursor padding-h-3 padding-w-5">
                        {this.props.page.schema?.icon && <Icon size={20} icon={this.props.page.schema?.icon || CollectTableSvg}></Icon>}
                        <span className="gap-l-5">{this.props.page.schema?.text}</span>
                    </span>
                    <span className="flex-centerdesk-no-drag "><Icon icon={ChevronRightSvg} size={20}></Icon></span>
                    <span className="desk-no-drag item-hover round flex cursor padding-h-3 padding-w-5">
                        <Icon size={20} icon={this.props.page?.formRowData?.icon || PageSvg}></Icon>
                        <span className="gap-l-5">{this.props.page?.formRowData?.title || '新页面'}</span>
                    </span>
                </>}
                {this.saving && <Loading1></Loading1>}
            </div>
        }
        else if ([ElementType.SchemaView, ElementType.SchemaRecordView].includes(this.props.page.pe.type) && !this.props.page.isSchemaRecordViewTemplate) {
            return <div className="flex-auto flex desk-drag">
                {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onPageClose()} className="desk-no-drag item-hover size-24 round cursor flex-center "><Icon size={20} icon={DoubleRightSvg}></Icon></span>}
                <span onMouseDown={e => this.props.page.onBack()} className="desk-no-drag item-hover round flex cursor padding-h-3 padding-w-5">
                    {this.props.page.schema?.icon && <Icon size={20} icon={this.props.page.schema?.icon || CollectTableSvg}></Icon>}
                    <span className="gap-l-5">{this.props.page.schema?.text}</span>
                </span>
                <span className="desk-no-drag flex-center"><Icon icon={ChevronRightSvg} size={18}></Icon></span>
                <span className="desk-no-drag item-hover round flex cursor padding-h-3 padding-w-5">
                    <Icon size={20} icon={this.props.page?.formRowData?.icon || PageSvg}></Icon>
                    <span className="gap-l-5">{this.props.page?.formRowData?.title || '新页面'}</span>
                </span>
                {this.props.page.locker?.lock && this.props.page.isCanManage && <span onMouseDown={e => this.props.page.onLockPage()} className="desk-no-drag flex-center visible size-24 item-hover cursor round">
                    <Icon size={18} icon={LockSvg}></Icon>
                </span>}
                {this.saving && <Loading1></Loading1>}
            </div>
        }
        else if (this.props.page.isSchemaRecordViewTemplate) {
            var sv = this.props.page.schema.views.find(g => g.id == this.props.page.pe.id1);
            return <div className="flex-auto flex desk-drag">
                {this.props.page.openSource == 'slide' && <span onMouseDown={e => this.props.page.onPageClose()} className="desk-no-drag item-hover size-24 round cursor flex-center "><Icon size={20} icon={DoubleRightSvg}></Icon></span>}
                <span onMouseDown={e => this.props.page.onBack()} className="desk-no-drag item-hover round flex cursor padding-h-3 padding-w-5">
                    {this.props.page.schema?.icon && <Icon size={20} icon={this.props.page.schema?.icon || CollectTableSvg}></Icon>}
                    <span className="gap-l-5">{this.props.page.schema?.text}</span>
                </span>
                <span className="desk-no-drag flex-center"><Icon icon={ChevronRightSvg} size={18}></Icon></span>
                <span className="desk-no-drag item-hover round flex  cursor padding-h-3 padding-w-5">
                    <Icon size={20} icon={sv?.icon || PageSvg}></Icon>
                    <span className="gap-l-5">{sv?.text || ''}</span>
                </span>
                {this.props.page.locker?.lock && this.props.page.isCanManage && <span onMouseDown={e => this.props.page.onLockPage()} className="desk-no-drag flex-center visible size-24 item-hover cursor round">
                    <Icon size={18} icon={LockSvg}></Icon>
                </span>}
                {this.saving && <Loading1></Loading1>}
            </div>
        }
        return <div className="flex-auto flex desk-drag">
            {this.props.page.openSource == 'slide' && <span  onMouseDown={e => this.props.page.onPageClose()} className="desk-no-drag item-hover size-24 round cursor flex-center "><Icon size={20} icon={DoubleRightSvg}></Icon></span>}
            <span className=" round flex ">
                <span className="flex-fixed desk-no-drag  item-hover flex round  cursor padding-h-3 padding-w-5 ">
                    {this.props.page?.pageInfo?.icon && <Icon size={20} icon={getPageIcon(this.props.page?.pageInfo)}></Icon>}
                    <span className={"gap-l-5 text-overflow " + (isMobileOnly ? "max-w-120" : "max-w-300")}>{getPageText(this.props.page?.pageInfo)}</span>
                </span>
                <span className={"flex-auto gap-l-5 remark text-overflow " + (isMobileOnly ? " max-w-250" : " max-w-500")}>{this.props.page?.pageInfo?.description}</span>
            </span>
            {this.props.page.locker?.lock && this.props.page.isCanManage && <span onMouseDown={e => this.props.page.onLockPage()} className="desk-no-drag flex-center size-24 item-hover cursor round">
                <Icon size={18} icon={LockSvg}></Icon>
            </span>}
            {this.saving && <Loading1></Loading1>}
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
            {(this.users.length > 1 || this.users.length == 1 && this.props.page.user?.id && this.users[0] != this.props.page.user?.id) && <UserAvatars limit={5} size={30} users={this.users}></UserAvatars>}
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
        if (this.props.page.isPubSite) {
            if (this.props.page.isSign) return <div className="flex   gap-r-10">
                <span onClick={e => this.toHome()} className="size-40 gap-r-30 flex-center cursor"><Avatar size={32} userid={user.id}></Avatar></span>
            </div>
            else if (this.props.page.openSource == 'page') return <div className="flex r-flex-center  r-gap-r-10 ">
                <Button size="small" onClick={e => this.toLogin()}><S>登录</S></Button>
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
        var isAi:boolean=this.props.page.ws?.aiConfig?.aiSearch;
        if (!this.props.page.isSign) {
            isPublish = false;
        }
        if (this.props.page.openSource == 'slide' || this.props.page.openSource == 'dialog') {
            isSearch = false;
        }
        if (this.props.page.pe.type == ElementType.SchemaData) {
            isField = true;
            if (!isCanEdit) {
                isField = false;
                isPublish = false;
            }
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
            {isField && <span onMouseDown={e => this.props.page.onOpenFieldProperty(e)} ><Icon size={18} icon={{ name: 'bytedance-icon', code: 'setting-one' }}></Icon></span>}
            {isMember && <span onMouseDown={e => this.props.page.onOpenMember(e)} ><Icon size={18} icon={MemberSvg}></Icon></span>}
            {isSearch && <span onMouseDown={async e => { await useSearchBox({ ws: this.props.page.ws }) }}><Icon size={18} icon={SearchSvg}></Icon></span>}
            {isAi&& <span onMouseDown={async e => { await useAISearchBox({ ws: this.props.page.ws }) }}><Icon size={18} icon={AiStartSvg}></Icon></span>}
            {isPublish && <span onMouseDown={e => this.props.page.onOpenPublish(e)} ><Icon size={18} icon={PublishSvg}></Icon></span>}
            {isContextMenu && <span onMouseDown={e => this.props.page.onPageContextmenu(e)} ><Icon size={18} icon={DotsSvg}></Icon></span>}
            {!isCanEdit && ws.access == 0 && !ws.isMember && <span className="size-30 gap-r-30"><Avatar size={32} userid={user.id}></Avatar></span>}
        </div>
        else if (this.props.page.openSource == 'page') return <div className="flex r-flex-center  r-gap-r-10 ">
            <Button size="small" onClick={e => this.toLogin()}><S>登录</S></Button>
        </div>
        else return <></>
    }
    onSpreadMenu() {
        this.props.page.emit(PageDirective.spreadSln)
    }
    render(): React.ReactNode {
        if (this.props.page.visiblePageBar === false) return <></>
        var isFormData = this.props.page.pe.type == ElementType.SchemaData && this.props.page.openSource != 'page'
        if (this.props.page.isPubSiteDefineBarMenu && !isFormData) {
            return this.renderDefineBar();
        }
        var isDocCard = this.props.page.pageLayout?.type == PageLayoutType.docCard;
        var style: CSSProperties = {}
        if (isDocCard) {
            style.backdropFilter = `blur(20px) saturate(170%)`;
            style.backgroundColor = 'rgba(255, 252, 248, 0.75)';
        }
        return <div style={style} className={"shy-page-bar flex visible-hover relative " + (isMobileOnly ? "" : "padding-l-10")}>
            {isMobileOnly && <span onClick={e => this.onSpreadMenu()} className="flex-fixed size-20 flex-center item-hover round cursor ">
                <Icon icon={ChevronLeftSvg} size={18}></Icon>
            </span>}
            {!isMobileOnly && this.props.page.openSource == 'page' && !this.props.page.isPubSiteDefineContent && <ToolTip placement="bottom" overlay={lst('折叠侧边栏')}><span onClick={e => this.onSpreadMenu()} className="flex-fixed size-24 flex-center item-hover round cursor ">
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
        if (this.props.page.isPubSiteDefineContent) {
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