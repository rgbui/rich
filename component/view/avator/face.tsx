import React from 'react';
import { channel } from '../../../net/channel';
import { autoImageUrl } from '../../../net/element.type';
import { Rect } from '../../../src/common/vector/point';
import { UserBasic, UserStatus } from '../../../types/user';
import { useUserCard } from './card';
import "./style.less";

export class Avatar extends React.Component<{
    size?: number,
    userid?: string,
    user?: UserBasic,
    showCard?: boolean,
    head?: React.ReactNode,
    showSn?: boolean,
    className?: string,
    showName?: boolean,
    hideStatus?: boolean

}> {
    private user: UserBasic;
    componentDidMount() {
        this.load();
        channel.sync('/user/basic/sync', this.syncUpdate)
    }
    componentWillUnmount(): void {
        channel.off('/user/basic/sync', this.syncUpdate)
    }
    syncUpdate = (user: UserBasic) => {
        if (this.props.userid && this.user) {
            if (this.props.userid == user.id) {
                Object.assign(this.user, user);
                this.forceUpdate();
            }
        }
        if (this.props.user && this.props.user.id == user.id) {
            Object.assign(this.props.user, user);
            this.forceUpdate();
        }
    }
    async load(force?: boolean) {
        if (force == true || !this.user && !this.props.user) {
            if (!this.props.userid) {
                return;
            }
            var r = await channel.get('/user/basic', { userid: this.props.userid });
            if (r.ok) {
                this.user = r.data.user as any;
                this.forceUpdate()
            }
        }
    }
    async mousedown(event: React.MouseEvent) {
        if (this.props.userid && this.props.showCard == true) {
            event.stopPropagation();
            await useUserCard({ roundArea: Rect.fromEvent(event) }, { user: this.props.user, userid: this.props.userid })
        }
    }
    render() {
        var user = this.props.user || this.user;
        var size = this.props.size ? this.props.size : 20;
        var renderIcon = () => {
            if (user) {
                if (user?.avatar) return <img style={{ width: size, height: size }} src={autoImageUrl(user.avatar.url, 120)} />
                if (user?.name) return <span style={{ width: size, height: size, fontSize: size * 0.6, lineHeight: (size * 0.6) + 'px' }}
                    className='shy-avatar-name'>{user.name.slice(0, 1)}</span>
            }
        }
        var renderStatus = () => {
            if (!user) return <></>;
            return <div className='shy-avatar-status'>
                {(user.status == UserStatus.online && user.online == true) && <div className='shy-avatar-status-online'>
                    <svg x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">
                        <rect fill="rgb(59, 165, 93)" width="25" height="15" mask="url(#user-avator-mask-online)"></rect>
                    </svg>
                </div>}
                {user.status == UserStatus.busy && user.online == true && <div className='shy-avatar-status-busy'><svg x="14.5" y="17" width="25" height="15"
                    viewBox="0 0 25 15">
                    <rect fill="rgb(237, 66, 69)" width="25" height="15" mask="url(#user-avator-mask-busy)"></rect>
                </svg>
                </div>}
                {(user.status == UserStatus.hidden || typeof user.status == 'undefined' || user.online == false) && <div className='shy-avatar-status-hidden'>
                    <svg x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">
                        <rect fill="rgb(116, 127, 141)" width="25" height="15" mask="url(#user-avator-mask-hidden)"></rect></svg>
                </div>}
                {user.status == UserStatus.idle && user.online == true && <div className='shy-avatar-status-idle'>
                    <svg x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">

                        <rect
                            fill="rgb(250, 168, 26)" width="25" height="15"
                            mask="url(#user-avator-mask-idle)"></rect>
                    </svg>
                </div>}
            </div>
        }
        if (this.props.head || this.props.showName || this.props.showSn) {
            return <div className={'shy-avatar-say' + " " + (this.props.className || "")}>
                <div className={'shy-avatar-say-face'} onMouseDown={e => this.mousedown(e)}>{renderIcon()}{size > 24 && this.props.hideStatus !== true && renderStatus()}</div>
                <div className={'shy-avatar-say-content'} >
                    <div className={'shy-avatar-say-content-head'}><div className='left' onMouseDown={e => this.mousedown(e)}><a className='shy-avatar-say-username' >{user?.name}</a>{this.props.showSn !== false && <span>#{user?.sn}</span>}</div>{this.props.head && <div className='right'>{this.props.head}</div>}</div>
                    {this.props.children && <div className={'shy-avatar-say-content-body'}>{this.props.children}</div>}
                </div>
            </div>
        }
        else
            return <div className={'shy-avatar' + " " + (this.props.className || "")} style={{ width: size, height: size }} onMouseDown={e => this.mousedown(e)}>
                {renderIcon()}
                {size > 24 && this.props.hideStatus !== true && renderStatus()}
            </div>
    }
}
