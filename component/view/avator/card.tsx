import React from "react";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { channel } from "../../../net/channel";
import { autoImageUrl } from "../../../net/element.type";
import { UserBasic } from "../../../types/user";
import { EventsComponent } from "../../lib/events.component";
import { Avatar } from "./face";
import "./style.less";
import { Icon } from "../icon";
import { CheckSvg } from '../../svgs';
export class UserCard extends EventsComponent {
    user: UserBasic;
    render(): React.ReactNode {
        // var u = channel.query('/query/current/user');
        return <div className="shy-user-card">
            {this.user && <><div className="shy-user-card-cover">
                {this.user?.cover?.url && <img src={autoImageUrl(this.user?.cover?.url, 500)} />}
                {!this.user?.cover?.url && <div style={{ height: 60, backgroundColor: this.user?.cover?.color ? this.user?.cover?.color : "#d85050" }}></div>}
            </div><div className="shy-user-card-content">
                    <div className="shy-user-card-head">
                        <div className="user-avatar">
                            <Avatar size={50} user={this.user}></Avatar>
                        </div>
                        <div className="shy-user-card-name">
                            <span>{this.user.name}</span>
                            {this.user?.role == 'robot' && <span className='bg-p-1 text-white round flex-center flex-inline padding-w-3  h-16 gap-w-2' style={{ color: '#fff', backgroundColor: 'rgb(88,101,242)' }}>
                                <Icon icon={CheckSvg} size={12}></Icon><span className='gap-l-2 f-12' style={{ color: '#fff' }}>机器人</span>
                            </span>}
                        </div>
                        <div className="shy-user-card-operators"></div>
                    </div>
                    <div className="shy-user-card-remark">{this.user.slogan}</div>
                    {/* {u && u.id && <div className="shy-user-card-send">
                        <Input placeholder={"私信@" + this.user.name}></Input>
                    </div>} */}
                </div></>}
        </div>
    }
    async open(options?: { userid?: string, user?: UserBasic }) {
        if (options.user)
            this.user = options.user;
        else {
            var r = await channel.get('/user/basic', { userid: options.userid });
            if (r.ok) {
                this.user = r.data.user as any;
            }
        }
        this.forceUpdate(() => {
            this.emit('update')
        })
    }
}

export async function useUserCard(pos: PopoverPosition, options?: { user?: UserBasic, userid?: string }) {
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