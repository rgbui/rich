import React, { CSSProperties } from "react";
import { channel } from "../../../net/channel";
import { LinkWs, WorkspaceNavMenuItem } from "../declare";
import { Button } from "../../../component/view/button";
import { Avatar } from "../../../component/view/avator/face";
import { Icon } from "../../../component/view/icon";
import { ChevronDownSvg } from "../../../component/svgs";
import { UserBasic } from "../../../types/user";
import { lst } from "../../../i18n/store";
import lodash from "lodash";
import { S } from "../../../i18n/view";

export class DefinePageNavBar extends React.Component<{
    ws: LinkWs,
    style?: CSSProperties,
    user?: UserBasic,
}>{
    constructor(props) {
        super(props);
    }
    render() {
        var self = this;
        var props = this.props;
        var h = props.ws.publishConfig.contentTheme == 'default' ? 48 : 48;
        function mousedown(e: React.MouseEvent, item: WorkspaceNavMenuItem) {
            e.preventDefault();
            if (item.urlType == 'url') {
                location.href = item.url;
            }
            else if (item.urlType == 'page') {
                channel.air('/page/open', { item: item.pageId })
            }
            return false;
        }
        function renderNavs(childs: WorkspaceNavMenuItem[], deep = 0) {
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
            return <div className="pos shadow border  round bg-white"
                style={style}>{childs.map((e, i) => {
                    var href = e.urlType == 'url' ? e.url : undefined;
                    if (e.urlType == 'page') {
                        href = props.ws.resolve({ pageId: e.pageId });
                    }
                    return <div onMouseEnter={eg => {
                        e.spread = true;
                        self.forceUpdate();
                    }}
                        onMouseLeave={eg => {
                            e.spread = false;
                            self.forceUpdate();
                        }} className="relative"
                        key={e.id}>
                        <a style={{ color: 'inherit' }}
                            href={href} onClick={eg => mousedown(eg, e)}
                            className={"flex  round min-w-120 item-hover  padding-w-10 padding-h-5  " + (false ? "dashed" : 'border-t')} >
                            {e.icon && <span className="flex-fixed size-20 flex-center"><Icon size={18} icon={e.icon}></Icon></span>}
                            <span className="flex-auto text-overflow">{e.text || lst('菜单项')}</span>
                            <span className="flex-fixed">
                                {Array.isArray(e.childs) && e.childs.length > 0 && <Icon size={16} icon={ChevronDownSvg}></Icon>}
                            </span>
                        </a>
                        {Array.isArray(e.childs) && e.childs.length > 0 && e.spread == true && renderNavs(e.childs, deep + 1)}
                    </div>
                })}</div>
        }
        function toLogin() {
            var back = location.href;
            if (window.shyConfig?.isDev) location.href = '/sign/in'
            else location.href = (window.shyConfig.isUS ? "https://shy.red/sign/in?back=" : 'https://shy.live/sign/in?back=') + encodeURIComponent(back);
        }
        var style: CSSProperties = Object.assign({}, this.props.style || {});
        var ns = this.getNavMenus();
        return <div className="shy-page-bar " >
            <div className="flex" style={style}>
                <div className="flex-auto flex r-gap-r-10">
                    {ns.map((e, i) => {
                        var href = e.urlType == 'url' ? e.url : undefined;
                        if (e.urlType == 'page') {
                            href = props.ws.resolve({ pageId: e.pageId });
                        }
                        return <div className="relative"
                            style={{
                                zIndex: 100000
                            }}
                            onMouseEnter={eg => {
                                e.spread = true
                                self.forceUpdate();
                            }}
                            onMouseLeave={eg => {
                                e.spread = false;
                                self.forceUpdate();
                            }}
                            key={e.id}>
                            <a href={href} onClick={eg => mousedown(eg, e)}
                                style={{ height: h, color: 'inherit' }} className={"flex round padding-w-10  " + (false ? "dashed" : 'border-t')}>
                                {e.type == 'logo' && e.pic && <img className="obj-center " style={{ height: 40 }} src={e.pic?.url} />}
                                {e.icon && <span className="flex-fixed size-20 flex-center"><Icon size={18} icon={e.icon}></Icon></span>}
                                <span className={"flex-auto" + (e.text ? (e.type == 'logo' ? " bold f-18 " : " bold f-16 ") : " remark")}>{e.text || lst('菜单项')}</span>
                                <span className="flex-fixed flex-center">
                                    {Array.isArray(e.childs) && e.childs.length > 0 && <Icon size={16} icon={ChevronDownSvg}></Icon>}
                                </span>
                            </a>
                            {Array.isArray(e.childs) && e.childs.length > 0 && e.spread == true && renderNavs(e.childs)}
                        </div>
                    })}
                </div>
                <div className="flex-fixed flex-end">
                    {!props.user && <Button size="small" onClick={e => toLogin()}><S>登录</S></Button>}
                    {props.user && <Avatar onMousedown={e => {
                        if (window.shyConfig?.isPro) {
                            if (window.shyConfig.isUS) location.href = 'https://shy.red/home'
                            else location.href = 'https://shy.live/home'
                        }
                        else {
                            location.href = '/home'
                        }
                    }} size={32} userid={props.user.id}></Avatar>}
                </div>
            </div>
        </div>
    }
    getNavMenus() {
        var ns = lodash.cloneDeep(this.props.ws.publishConfig.navMenus);
        ns.arrayJsonEach('childs', g => {
            g.spread = false;
        })
        return ns;
    }
}