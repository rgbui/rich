import React from 'react';
import { channel } from '../../../net/channel';
import { autoImageUrl } from '../../../net/element.type';
import { Rect } from '../../../src/common/vector/point';
import { UserBasic, UserStatus } from '../../../types/user';
import { useUserCard } from './card';
import { CheckSvg } from '../../svgs';
import { Icon } from '../icon';
import lodash from 'lodash';
import { lst } from '../../../i18n/store';
import { S } from '../../../i18n/view';
import { LinkWs } from '../../../src/page/declare';
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
    hideStatus?: boolean,
    ws?: LinkWs,
    onMousedown?: (event: React.MouseEvent) => void
}> {
    private user: UserBasic;
    componentDidMount() {
        this.isUn = true;
        this.load();
        channel.sync('/user/basic/sync', this.syncUpdate)
    }
    componentWillUnmount(): void {
        this.isUn = false;
        channel.off('/user/basic/sync', this.syncUpdate)
    }
    isUn: boolean = false;
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
            if (this.props.userid == 'all') {
                this.user = { id: 'all', status: UserStatus.online, role: 'user', name: lst('所有人') };
                this.forceUpdate();
            }
            else {
                var r = await channel.get('/user/basic', { userid: this.props.userid });
                if (r.ok) {
                    this.user = r.data.user as any;
                    if (this.isUn)
                        this.forceUpdate()
                }
            }
        }
    }
    async mousedown(event: React.MouseEvent) {
        if (this.props.userid && this.props.showCard == true) {
            event.stopPropagation();
            if (this.props.userid == 'all') return;
            await useUserCard({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
                user: this.props.user,
                ws: this.props.ws,
                userid: this.props.userid
            })
        }
        if (typeof this.props.onMousedown == 'function')
            this.props.onMousedown(event)
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
                {(user.status == UserStatus.online && user.online == true || user.id == 'all' || user.online == true && (typeof user.status == 'undefined' || lodash.isNull(user.status)) || user.role == 'robot') && <div className='shy-avatar-status-online'>
                    <svg x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15">
                        <rect fill="rgb(59, 165, 93)" width="25" height="15" mask="url(#user-avator-mask-online)"></rect>
                    </svg>
                </div>}
                {user.status == UserStatus.busy && user.online == true && <div className='shy-avatar-status-busy'><svg x="14.5" y="17" width="25" height="15"
                    viewBox="0 0 25 15">
                    <rect fill="rgb(237, 66, 69)" width="25" height="15" mask="url(#user-avator-mask-busy)"></rect>
                </svg>
                </div>}
                {(user.status == UserStatus.hidden || user.online == false) && <div className='shy-avatar-status-hidden'>
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
                    <div className={'shy-avatar-say-content-head'}><div className='left flex' onMouseDown={e => this.mousedown(e)}>
                        <a className='shy-avatar-say-username' >{user?.name}</a>
                        {user?.role == 'robot' && <span className='bg-p-1 text-white round flex-center flex-inline padding-w-3  h-16 gap-w-2' style={{ color: '#fff', backgroundColor: 'rgb(88,101,242)' }}>
                            <Icon icon={CheckSvg} size={12}></Icon><span className='gap-l-2 f-12' style={{ color: '#fff' }}><S>机器人</S></span>
                        </span>}
                        {this.props.showSn === true && typeof user?.sn == 'number' && <span>#{user?.sn}</span>}
                    </div>
                        {this.props.head && <div className='right'>{this.props.head}</div>}</div>
                    {this.props.children && <div className={'shy-avatar-say-content-body'}>{this.props.children}</div>}
                </div>
            </div>
        }
        else return <div className={'shy-avatar' + " " + (this.props.className || "")} style={{ width: size, height: size }} onMouseDown={e => this.mousedown(e)}>
            {renderIcon()}
            {size > 24 && this.props.hideStatus !== true && renderStatus()}
        </div>
    }
    componentDidUpdate(prevProps: Readonly<{ size?: number; userid?: string; user?: UserBasic; showCard?: boolean; head?: React.ReactNode; showSn?: boolean; className?: string; showName?: boolean; hideStatus?: boolean; onMousedown?: (event: React.MouseEvent) => void; }>, prevState: Readonly<{}>, snapshot?: any): void {
        if (prevProps.userid != this.props.userid || prevProps.user?.id != this.props.user?.id) {
            this.load(true);
        }
    }
}
