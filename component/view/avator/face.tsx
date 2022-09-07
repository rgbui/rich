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
    children?: React.ReactNode,
    showSn?: boolean,
    className?: string,
    showName?: boolean
}> {
    private user: UserBasic;
    componentDidMount() {
        this.load()
    }
    async load(force?: boolean) {
        if (force == true || !this.user && !this.props.user) {
            if (!this.props.userid) {
                // console.trace(this.props);
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
                {user.status == UserStatus.online && <div className='shy-avatar-status-online'>
                    <svg x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15"><mask id="c4f52791-6ee2-4a19-b7dc-a20086dccadc"><rect x="7.5" y="5" width="10" height="10" rx="5" ry="5" fill="white"></rect><rect x="12.5" y="10" width="0" height="0" rx="0" ry="0" fill="black"></rect><polygon points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)" style={{ transformOrigin: '13.125px 10px' }} ></polygon><circle fill="black" cx="12.5" cy="10" r="0"></circle></mask><rect fill="rgb(59, 165, 93)" width="25" height="15" mask="url(#c4f52791-6ee2-4a19-b7dc-a20086dccadc)"></rect></svg>
                </div>}
                {user.status == UserStatus.busy && <div className='shy-avatar-status-busy'><svg x="14.5" y="17" width="25" height="15"
                    viewBox="0 0 25 15"><mask
                        id="c4f52791-6ee2-4a19-b7dc-a20086dccadc"><rect x="7.5" y="5" width="10" height="10"
                            rx="5" ry="5" fill="white"></rect><rect x="8.75"
                                y="8.75" width="7.5" height="2.5" rx="1.25" ry="1.25" fill="black"></rect><polygon
                                    points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)" style={{ transformOrigin: '13.125px 10px' }} ></polygon><circle fill="black" cx="12.5" cy="10" r="0"></circle></mask><rect fill="rgb(237, 66, 69)" width="25" height="15" mask="url(#c4f52791-6ee2-4a19-b7dc-a20086dccadc)"></rect></svg></div>}
                {(user.status == UserStatus.hidden || !(user.status ? true : false) || user.status == UserStatus.offline) && <div className='shy-avatar-status-hidden'>
                    <svg x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15"><mask id="c4f52791-6ee2-4a19-b7dc-a20086dccadc"><rect x="7.5" y="5" width="10" height="10" rx="5" ry="5" fill="white"></rect><rect x="10" y="7.5" width="5" height="5" rx="2.5" ry="2.5" fill="black"></rect><polygon points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)"
                        style={{ transformOrigin: '13.125px 10px' }} ></polygon><circle fill="black" cx="12.5" cy="10" r="0"></circle></mask><rect fill="rgb(116, 127, 141)" width="25" height="15" mask="url(#c4f52791-6ee2-4a19-b7dc-a20086dccadc)"></rect></svg>
                </div>}
                {user.status == UserStatus.idle && <div className='shy-avatar-status-idle'>
                    <svg x="14.5" y="17" width="25" height="15" viewBox="0 0 25 15"><mask
                        id="c4f52791-6ee2-4a19-b7dc-a20086dccadc"><rect
                            x="7.5" y="5" width="10" height="10" rx="5" ry="5"
                            fill="white"></rect><rect x="6.25" y="3.75"
                                width="7.5" height="7.5" rx="3.75" ry="3.75" fill="black"></rect><polygon points="-2.16506,-2.5 2.16506,0 -2.16506,2.5" fill="black" transform="scale(0) translate(13.125 10)"
                                    style={{ transformOrigin: '13.125px 10px' }}></polygon>
                        <circle fill="black" cx="12.5" cy="10" r="0"></circle></mask><rect
                            fill="rgb(250, 168, 26)" width="25" height="15"
                            mask="url(#c4f52791-6ee2-4a19-b7dc-a20086dccadc)"></rect></svg>
                </div>}
            </div>
        }
        if (this.props.head || this.props.showName || this.props.children || this.props.showSn) {
            return <div className={'shy-avatar-say' + " " + this.props.className}>
                <div className={'shy-avatar-say-face'} onMouseDown={e => this.mousedown(e)}>{renderIcon()}</div>
                <div className={'shy-avatar-say-content'} >
                    <div className={'shy-avatar-say-content-head'}><div className='left' onMouseDown={e => this.mousedown(e)}><a className='shy-avatar-say-username' >{user?.name}</a>{this.props.showSn !== false && <span>#{user?.sn}</span>}</div>{this.props.head && <div className='right'>{this.props.head}</div>}</div>
                    {this.props.children && <div className={'shy-avatar-say-content-body'}>{this.props.children}</div>}
                </div>
            </div>
        }
        else
            return <div className={'shy-avatar' + " " + this.props.className} style={{ width: size, height: size }} onMouseDown={e => this.mousedown(e)}>
                {renderIcon()}
                {size > 30 && renderStatus()}
            </div>
    }
}
