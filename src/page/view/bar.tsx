import React from "react";
import { Page } from "..";
import { DotsSvg, MemberSvg, PublishSvg, SearchSvg } from "../../../component/svgs";
import { UserAvatars } from "../../../component/view/avator/users";
import { Button } from "../../../component/view/button";
import { Icon } from "../../../component/view/icon";
import { Spin } from "../../../component/view/spin";
import { getPageIcon } from "../../../extensions/at/declare";
import { useSearchBox } from "../../../extensions/search";
import { channel } from "../../../net/channel";
import { PageLayoutType } from "../declare";
import { PageDirective } from "../directive";

export class PageBar extends React.Component<{ page: Page }>{
    renderTitle() {
        return <div className="flex-auto flex">
            <span className="item-hover round flex gap-l-10 cursor padding-h-3 padding-w-5 ">
                <Icon size={18} icon={getPageIcon(this.props.page?.pageInfo)}></Icon>
                <span className="gap-l-5">{this.props.page?.pageInfo?.text}</span>
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

        if ([PageLayoutType.textChannel].includes(this.props.page.pageLayout.type)) return <></>
        return <div className="gap-r-10">
            <UserAvatars users={this.users}></UserAvatars>
        </div>
    }
    toLogin() {
        location.href = 'https://shy.live';
    }
    renderPropertys() {
        var user = channel.query('/query/current/user');
        var isSign = user.id ? true : false;
        if (isSign)
            return <div className="flex r-flex-center r-size-24 r-item-hover r-round r-cursor r-gap-r-10 text-1">
                {[PageLayoutType.textChannel].includes(this.props.page.pageLayout.type) && <span onMouseDown={e => this.props.page.openMember(e)} ><Icon size={18} icon={MemberSvg}></Icon></span>}
                {![PageLayoutType.textChannel].includes(this.props.page.pageLayout.type) && <span onMouseDown={async e => { await useSearchBox({ isNav: true }) }}><Icon size={18} icon={SearchSvg}></Icon></span>}
                {![PageLayoutType.textChannel].includes(this.props.page.pageLayout.type) && <span onMouseDown={e => this.props.page.onOpenPublish(e)} ><Icon size={18} icon={PublishSvg}></Icon></span>}
                {![PageLayoutType.textChannel].includes(this.props.page.pageLayout.type) && <span onMouseDown={e => this.props.page.onPageContextmenu(e)} ><Icon size={18} icon={DotsSvg}></Icon></span>}
            </div>
        else return <div className="flex r-flex-center r-size-24 r-item-hover r-round r-cursor r-gap-r-10 text-1">
            <Button onClick={e => this.toLogin()}>登录</Button>
        </div>
    }

    render(): React.ReactNode {
        return <div className="shy-page-bar flex">
            {this.renderTitle()}
            <div className="flex-fixed flex">{this.renderUsers()}{this.renderPropertys()}</div>
        </div>
    }
}