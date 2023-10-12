import React, { CSSProperties } from "react";
import { channel } from "../../../net/channel";
import { LinkWs, WorkspaceNavMenuItem } from "../declare";
import { Button } from "../../../component/view/button";
import { Avatar } from "../../../component/view/avator/face";
import { Icon } from "../../../component/view/icon";
import { ChevronDownSvg, LogoutSvg, SearchSvg, SettingsSvg } from "../../../component/svgs";
import { UserBasic } from "../../../types/user";
import { lst } from "../../../i18n/store";
import lodash from "lodash";
import { S } from "../../../i18n/view";
import { Input } from "../../../component/view/input";
import { Rect } from "../../common/vector/point";
import { useSelectMenuItem } from "../../../component/view/menu";
import { useSearchBox } from "../../../extensions/search/keyword";
import { isMobileOnly } from "react-device-detect";

export class DefinePageNavBar extends React.Component<{
    ws: LinkWs,
    style?: CSSProperties,
    user?: UserBasic,
    renderUser?: JSX.Element
}>{
    constructor(props) {
        super(props);
    }
    mouseItem(e: React.MouseEvent, item: WorkspaceNavMenuItem) {
        e.preventDefault();
        if (isMobileOnly) {
            if (item.spread == false) {
                item.spread = true; this.forceUpdate();
                return;
            }
        }
        if (item.urlType == 'url') {
            location.href = item.url;
        }
        else if (item.urlType == 'page') {
            channel.air('/page/open', { item: item.pageId })
        }
        return false;
    }
    renderItem(e: WorkspaceNavMenuItem, deep: number) {
        var href = e.urlType == 'url' ? e.url : undefined;
        if (e.urlType == 'page') {
            href = this.props.ws.resolve({ pageId: e.pageId });
        }
        var hasLink = e.urlType == 'page' && e.pageId || e.urlType == 'url' && e.url;
        return <a href={href} style={{ color: hasLink ? 'inherit' : undefined, paddingLeft: isMobileOnly ? deep * 20 : undefined }} onMouseDown={eg => {
            this.mouseItem(eg, e)
        }} className={"flex round min-w-120   padding-w-10 padding-h-5  " + (e.remark ? " flex-top " : "") + (hasLink ? " item-hover " : " remark f-12 ")} >
            {e.icon && <span className="flex-fixed size-20 flex-center"><Icon size={hasLink ? 16 : 12} icon={e.icon}></Icon></span>}
            {!e.remark && <span className="flex-auto text-overflow">
                {e.text || lst('菜单项')}
            </span>}
            {e.remark && <div className="flex-auto">
                <div>{e.text || lst('菜单项')}</div>
                <div className="remark">{e.remark}</div>
            </div>}
            <span className="flex-fixed flex">
                {Array.isArray(e.childs) && e.childs.length > 0 && <span onMouseDown={ev => {
                    if (isMobileOnly) {
                        ev.stopPropagation();
                        e.spread = e.spread ? false : true;
                        this.forceUpdate();
                    }
                }} className="size-20 flex-center">
                    <Icon size={16} icon={ChevronDownSvg}></Icon>
                </span>}
            </span>
        </a>
    }
    renderNavs(childs: WorkspaceNavMenuItem[], deep = 0) {
        var h = this.props.ws.publishConfig.contentTheme == 'default' ? 48 : 48;
        var self = this;
        var style: React.CSSProperties = {
            top: h,
            right: 0
        }
        if (deep > 0) {
            style = {
                left: '100%',
                width: '100%',
                top: 0,
            }
        }
        if (isMobileOnly) {
            style.position = 'static';
            style.width = undefined;
            style.border = 'none';
        }
        return <div className="pos shadow border  round bg-white"
            style={style}>{childs.map((e, i) => {
                var href = e.urlType == 'url' ? e.url : undefined;
                if (e.urlType == 'page') {
                    href = this.props.ws.resolve({ pageId: e.pageId });
                }
                return <div
                    onMouseEnter={eg => {
                        if (isMobileOnly) return;
                        e.spread = true;
                        self.forceUpdate();
                    }}
                    onMouseLeave={eg => {
                        if (isMobileOnly) return;
                        e.spread = false;
                        self.forceUpdate();
                    }}
                    className="relative"
                    key={e.id}>
                    {this.renderItem(e, deep)}
                    {Array.isArray(e.childs) && e.childs.length > 0 && e.spread == true && this.renderNavs(e.childs, deep + 1)}
                </div>
            })}</div>
    }
    renderMenuNavs() {
        var self = this;
        var props = this.props;
        var h = props.ws.publishConfig.contentTheme == 'default' ? 48 : 48;

        return this.getNavMenus().map((e, i) => {
            var href = e.urlType == 'url' ? e.url : undefined;
            if (e.urlType == 'page') {
                href = props.ws.resolve({ pageId: e.pageId });
            }
            return <div className="relative"
                style={{
                    zIndex: 100000
                }}
                onMouseEnter={eg => {
                    e.spread = true;
                    self.forceUpdate();
                }}
                onMouseLeave={eg => {
                    e.spread = false;
                    self.forceUpdate();
                }}
                key={e.id}>
                <a href={href} onClick={eg => this.mouseItem(eg, e)}
                    style={{ height: h, color: 'inherit' }} className={"flex round padding-w-10  "}>
                    {e.type == 'logo' && e.pic && <img className="obj-center " style={{ height: 40 }} src={e.pic?.url} />}
                    {e.icon && <span className="flex-fixed size-20 flex-center"><Icon size={16} icon={e.icon}></Icon></span>}
                    <span className={"flex-auto " + ((e.type == 'logo' ? " f-18 " : " f-16 ") + (e.urlType == 'page' && e.pageId || e.urlType == 'url' && e.url ? "link-hover" : " remark "))}>{e.text || lst('菜单项')}</span>
                    <span className="flex-fixed flex-center">
                        {Array.isArray(e.childs) && e.childs.length > 0 && <Icon size={16} icon={ChevronDownSvg}></Icon>}
                    </span>
                </a>
                {Array.isArray(e.childs) && e.childs.length > 0 && e.spread == true && this.renderNavs(e.childs)}
            </div>
        })
    }
    mobleMenuSpread: boolean = false;
    renderMenuMobile() {
        var ns = this.getNavMenus();
        var logo = ns.find(g => g.type == 'logo');
        var href = logo.urlType == 'url' ? logo.url : undefined;
        if (logo.urlType == 'page') {
            href = this.props.ws.resolve({ pageId: logo.pageId });
        }
        var h = this.props.ws.publishConfig.contentTheme == 'default' ? 48 : 48;
        return <div className="flex">
            <div style={{ zIndex: 100000, position: 'relative' }}>
                <span onMouseDown={e => {
                    this.mobleMenuSpread = this.mobleMenuSpread ? false : true;
                    this.forceUpdate();
                }} className="size-40 flex-center text-1"><Icon size={24} icon={{ name: 'bytedance-icon', code: 'hamburger-button' }}></Icon></span>
                {this.mobleMenuSpread && <div className="pos vw100 bg-white" style={{ top: h }}>
                    {this.renderNavs(ns.findAll(g => g.type != 'logo'), 1)}
                </div>}
            </div>
            <a
                href={href}
                onClick={eg => this.mouseItem(eg, logo)}
                style={{ height: h, color: 'inherit' }} className={"flex round   "}
            >
                {logo.pic && <img className="obj-center " style={{ height: 40 }} src={logo.pic?.url} />}
                <span className={"flex-auto " + ((logo.type == 'logo' ? " f-18 " : " f-16 ") + (logo.urlType == 'page' && logo.pageId || logo.urlType == 'url' && logo.url ? "link-hover" : " remark "))}>{logo.text || lst('菜单项')}</span>
            </a>
        </div>
    }
    toLogin() {
        var back = location.href;
        if (window.shyConfig?.isDev) location.href = '/sign/in'
        else location.href = (window.shyConfig.isUS ? "https://shy.red/sign/in?back=" : 'https://shy.live/sign/in?back=') + encodeURIComponent(back);
    }
    toHome() {
        if (window.shyConfig?.isPro) {
            if (window.shyConfig.isUS) location.href = 'https://shy.red/home'
            else location.href = 'https://shy.live/home'
        }
        else {
            location.href = '/home'
        }
    }
    async onSearch(word: string) {
        await useSearchBox({ ws: this.props.ws, word: word, isNav: true });
    }
    async openUser(event: React.MouseEvent) {
        var rect = Rect.fromEle(event.currentTarget as HTMLElement);
        var r = await useSelectMenuItem({ roundArea: rect }, [
            { text: lst('主页'), name: 'home', icon: { name: 'bytedance-icon', code: 'home' } },
            { text: lst('个人中心'), name: 'user', icon: { name: "bytedance-icon", code: 'user' } },
            { text: lst('空间设置'), name: 'space', visible: this.props.ws.isManager ? true : false, icon: SettingsSvg },
            { text: lst('退出'), name: 'logout', icon: LogoutSvg }
        ]);
        if (r) {
            if (r.item.name == 'home') {
                this.toHome();
            }
            else if (r.item.name == 'user') {
                channel.act('/open/user/settings', {})
            }
            else if (r.item.name == 'space') {
                channel.act('/open/workspace/settings', {});
            }
            else if (r.item.name == 'logout') {
                channel.act('/user/logout', {});
            }
        }
    }
    render() {
        var props = this.props;
        var style: CSSProperties = Object.assign({}, this.props.style || {})
        return <div className="shy-page-bar ">
            <div className="flex" style={style}>
                <div className="flex-auto flex r-gap-r-10">
                    {!isMobileOnly && this.renderMenuNavs()}
                    {isMobileOnly && this.renderMenuMobile()}
                </div>
                <div className="flex-fixed flex-end">
                    {props.renderUser}
                    {props.ws.publishConfig.allowSearch && <div onMouseDown={e => {
                        if (isMobileOnly) this.onSearch(this.word);
                    }} className="gap-r-10" style={{ width: isMobileOnly ? 120 : 180 }}>
                        <Input onChange={e => this.word = e} onEnter={e => {
                            this.onSearch(this.word);
                        }}
                            placeholder={lst('搜索...')}
                            prefix={<span className="flex-center remark size-24"><Icon size={16} icon={SearchSvg}></Icon></span>}></Input>
                    </div>}
                    {!props.user && <Button size="small" onClick={e => this.toLogin()}><S>登录</S></Button>}
                    {props.user && <Avatar onMousedown={e => this.openUser(e)} size={32} userid={props.user.id}></Avatar>}
                </div>
            </div>
        </div>
    }
    word: string = '';
    cacheMenus: any;
    getNavMenus() {
        if (Array.isArray(this.cacheMenus)) return this.cacheMenus;
        var ns = lodash.cloneDeep(this.props.ws.publishConfig.navMenus);
        ns.arrayJsonEach('childs', g => {
            g.spread = false;
        })
        this.cacheMenus = ns;
        return ns;
    }
}