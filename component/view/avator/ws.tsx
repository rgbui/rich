import React from "react";
import { IconArguments, ResourceArguments } from "../../../extensions/icon/declare";
import { channel } from "../../../net/channel";
import { autoImageUrl } from "../../../net/element.type";

type WsInfo = {
    id: string,
    text: string,
    icon: IconArguments,
    cover: ResourceArguments,
    slogan: string,
    memberCount: number;
    memberOnlineCount: number;
};

export class WsAvatar extends React.Component<{
    wsId: string,
}> {
    ws: WsInfo;
    async componentDidMount() {
        if (!this.ws) {
            var r = await channel.get('/ws/basic', { wsId: this.props.wsId });
            if (r.ok) {
                this.ws = r.data.workspace as any;
                this.forceUpdate();
            }
        }
    }
    render() {
        if (!this.ws) return <></>
        function getFlags() {
            return <div className="shy-ws-avatar-flag">
                <svg aria-label="已验证 &amp; 已合作" aria-hidden="false" width="16" height="16" viewBox="0 0 16 15.2"><path fill="currentColor" fillRule="evenodd" d="m16 7.6c0 .79-1.28 1.38-1.52 2.09s.44 2 0 2.59-1.84.35-2.46.8-.79 1.84-1.54 2.09-1.67-.8-2.47-.8-1.75 1-2.47.8-.92-1.64-1.54-2.09-2-.18-2.46-.8.23-1.84 0-2.59-1.54-1.3-1.54-2.09 1.28-1.38 1.52-2.09-.44-2 0-2.59 1.85-.35 2.48-.8.78-1.84 1.53-2.12 1.67.83 2.47.83 1.75-1 2.47-.8.91 1.64 1.53 2.09 2 .18 2.46.8-.23 1.84 0 2.59 1.54 1.3 1.54 2.09z"></path></svg>
                <svg style={{ color: '#fff', marginTop: 5 }} aria-hidden="false" width="16" height="16" viewBox="0 0 16 15.2"><path d="M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z" fill="currentColor"></path></svg>
            </div>
        }
        return <div className="shy-ws-avatar">
            <div className="shy-ws-avatar-cover">
                {this.ws.cover && <img src={autoImageUrl(this.ws.cover.url, 500)} />}
                {!this.ws.cover && <div style={{ height: 153, backgroundColor: 'rgb(192, 157, 156)' }}></div>}
            </div>
            <div className="shy-ws-avatar-face">
                {this.ws.icon && <img src={autoImageUrl(this.ws.icon.url, 120)} />}
                {!this.ws.icon && <span>{this.ws.text.slice(0, 1)}</span>}
            </div>
            <div className="shy-ws-avatar-content">
                <div className="h3 flex">{getFlags()}<span>{this.ws.text}</span></div>
                <div className="shy-ws-avatar-slogan">{this.ws.slogan}</div>
                <div className="shy-ws-avatar-count">
                    <span><i className="online"></i><em>{this.ws.memberOnlineCount}在线</em></span>
                    <span><i className="off"></i><em>{this.ws.memberCount}成员</em></span>
                </div>
            </div>
        </div>
    }
}