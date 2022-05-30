import React from 'react';
import { channel } from '../../../net/channel';
import { autoImageUrl } from '../../../net/element.type';
import { Rect } from '../../../src/common/vector/point';
import { UserBasic } from '../../../types/user';
import { useUserCard } from './card';
import "./style.less";
export class Avatar extends React.Component<{
    size?: number,
    userid: string,
    openCard?: boolean,
    head?: React.ReactNode,
    children?: React.ReactNode,
    showSn?: boolean,
    showName?: boolean
}> {
    private user: UserBasic;
    async componentDidMount() {
        if (!this.user) {
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
        if (this.props.userid && this.props.openCard == true) {
            event.stopPropagation();
            await useUserCard({ roundArea: Rect.fromEvent(event) }, { userid: this.props.userid })
        }
    }
    render() {
        var size = this.props.size ? this.props.size : 20;
        var renderIcon = () => {
            if (this.props.userid) {
                if (this.user?.avatar) return <img style={{ width: size, height: size }} src={autoImageUrl(this.user.avatar.url, 120)} />
                if (this.user?.name) return <span style={{ width: size, height: size, fontSize: size * 0.6, lineHeight: (size * 0.6) + 'px' }}
                    className='shy-avatar-name'>{this.user.name.slice(0, 1)}</span>
            }
        }
        if (this.props.head || this.props.showName || this.props.children || this.props.showSn) {
            return <div className={'shy-avatar-say'}>
                <div className={'shy-avatar-say-face'} onMouseDown={e => this.mousedown(e)}>{renderIcon()}</div>
                <div className={'shy-avatar-say-content'} >
                    <div className={'shy-avatar-say-content-head'}><div className='left' onMouseDown={e => this.mousedown(e)}><a className='shy-avatar-say-username' >{this.user?.name}</a>{this.props.showSn !== false && <span>#{this.user?.sn}</span>}</div>{this.props.head && <div className='right'>{this.props.head}</div>}</div>
                    {this.props.children && <div className={'shy-avatar-say-content-body'}>{this.props.children}</div>}
                </div>
            </div>
        }
        else
            return <div className={'shy-avatar'} onMouseDown={e => this.mousedown(e)}>
                {renderIcon()}
            </div>
    }
}
