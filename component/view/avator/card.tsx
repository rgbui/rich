import React from "react";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { channel } from "../../../net/channel";
import { autoImageUrl } from "../../../net/element.type";
import { UserBasic } from "../../../types/user";
import { EventsComponent } from "../../lib/events.component";
import { Avatar } from "./face";
import { Icon } from "../icon";
import { CheckSvg, DotsSvg, LogoutSvg, SettingsSvg } from '../../svgs';
import { LinkWs } from "../../../src/page/declare";
import { useSelectMenuItem } from "../menu";
import { Rect } from "../../../src/common/vector/point";
import { lst } from "../../../i18n/store";
import { MenuItem, MenuItemType } from "../menu/declare";
import "./style.less"
import { Confirm } from "../../lib/confirm";
import { useOpenReport } from "../../../extensions/report";
import { ShyAlert } from "../../lib/alert";

export class UserCard extends EventsComponent {
    user: UserBasic;
    render(): React.ReactNode {
        var u = channel.query('/query/current/user');
        return <div className="shy-user-card">
            {this.user && <><div className="shy-user-card-cover">
                {this.user?.cover?.url && <img src={autoImageUrl(this.user?.cover?.url, 500)} />}
                {!this.user?.cover?.url && <div style={{ height: 60, backgroundColor: this.user?.cover?.color ? this.user?.cover?.color : "#d85050" }}></div>}
            </div><div className="shy-user-card-content">
                    <div className="shy-user-card-head">
                        <div className="user-avatar">
                            <Avatar size={50} user={this.user}></Avatar>
                        </div>
                        <div className="shy-user-card-name flex-auto">
                            <span>{this.user.name}</span>
                            {this.user?.role == 'robot' && <span className='bg-p-1 text-white round flex-center flex-inline padding-w-3  h-16 gap-w-2' style={{ color: '#fff', backgroundColor: 'rgb(88,101,242)' }}>
                                <Icon icon={CheckSvg} size={12}></Icon><span className='gap-l-2 f-12' style={{ color: '#fff' }}>机器人</span>
                            </span>}
                        </div>
                        <div className="shy-user-card-operators flex-fixed">
                            {(this.ws || u) && <span onMouseDown={e => this.onUserProperty(e)} className="gap-r-10  size-24 item-hover round cursor flex-center">
                                <Icon size={18} icon={DotsSvg}></Icon>
                            </span>}
                        </div>
                    </div>
                    <div className="shy-user-card-remark">{this.user.slogan}</div>
                    {/* {u && u.id && <div className="shy-user-card-send">
                        <Input placeholder={"私信@" + this.user.name}></Input>
                    </div>} */}
                </div></>}
        </div>
    }
    async onUserProperty(event: React.MouseEvent) {
        var rr = await channel.get('/friend/is', { friendId: this.user.id });
        var items: MenuItem<string>[] = [
            { name: 'letter', text: lst('私信'), icon: { name: 'bytedance-icon', code: 'send' } },
            { name: 'addFriends', visible: rr.data.is ? false : true, text: lst('加好友'), icon: { name: 'bytedance-icon', code: 'people-plus' } },
            { name: 'removeFriends', visible: rr.data.is ? true : false, text: lst('删除好友'), icon: { name: 'bytedance-icon', code: 'people-delete' } },
            { type: MenuItemType.divide },
            { name: 'addBlack', text: lst('拉黑'), icon: { name: 'bytedance-icon', code: 'people-safe' } },
            { name: 'report', text: lst('举报'), icon: { name: 'bytedance-icon', code: 'harm' } },
            { type: MenuItemType.divide },
            { name: 'removeMemeber', text: lst('移出空间'), icon: { name: 'bytedance-icon', code: 'people-delete' } }
        ]
        var u = channel.query('/query/current/user');
        if (u.id == this.user.id) {
            items = [
                { name: 'userSettings', text: lst('个人设置'), icon: SettingsSvg },
                { name: 'exitWorkspace', visible: this.ws ? true : false, text: lst('退出空间'), icon: LogoutSvg }
            ]
        }
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, items);
        if (r) {
            switch (r.item.name) {
                case 'letter':
                    await channel.act('/open/user/private/channel', { userid: this.user.id });
                    this.emit('close');
                    break;
                case 'addFriends':
                    await channel.put('/friend/join', { userid: this.user.id });
                    ShyAlert(lst('已发送好友请求'))
                    break;
                case 'removeFriends':
                    if (await Confirm(lst('确定删除好友？')))
                        await channel.del('/friend/delete', { id: this.user.id });
                    break;
                case 'addBlack':
                    if (await Confirm(lst('确定拉黑，拉黑无法加好友？')))
                        await channel.put('/blacklist/join', { otherId: this.user.id });
                    break;
                case 'report':
                    await useOpenReport({ userid: this.user.id });
                    this.emit('close');
                    break;
                case 'removeMemeber':
                    if (await Confirm(lst('确认移出成员？')))
                        await channel.act('/current/ws/remove/member', { userid: this.user.id })
                    break;
                case 'userSettings':
                    await channel.act('/open/user/settings');
                    this.emit('close');
                    break;
                case 'exitWorkspace':
                    await channel.act('/user/exit/current/workspace');
                    this.emit('close');
                    break;
            }
        }
    }
    ws: LinkWs;
    async open(options?: { userid?: string, ws?: LinkWs, user?: UserBasic }) {
        if (options.user)
            this.user = options.user;
        else {
            var r = await channel.get('/user/basic', { userid: options.userid });
            if (r.ok) {
                this.user = r.data.user as any;
            }
        }
        if (options?.ws) this.ws = options.ws;
        else this.ws = null;
        this.forceUpdate(() => {
            this.emit('update')
        })
    }
}

export async function useUserCard(pos: PopoverPosition, options?: { user?: UserBasic, ws?: LinkWs, userid?: string }) {
    let popover = await PopoverSingleton(UserCard, { frame: true, mask: true });
    let fv = await popover.open(pos);
    fv.only('update', () => {
        popover.updateLayout()
    })
    fv.open(options);
    return new Promise((resolve: (data: {
        text: string,
        url: string
    }) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });

        popover.only('close', () => {
            resolve(null)
        });
    })
}