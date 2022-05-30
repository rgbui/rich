import React from "react";
import { PopoverSingleton } from "../../../extensions/popover/popover";
import { PopoverPosition } from "../../../extensions/popover/position";
import { autoImageUrl } from "../../../net/element.type";
import { UserBasic } from "../../../types/user";
import { EventsComponent } from "../../lib/events.component";
import { Avatar } from "./face";
import "./style.less";

export class UserCard extends EventsComponent {
    user: Partial<UserBasic>;
    render(): React.ReactNode {
        return <div className="shy-user-card">
            {this.user && <><div className="shy-user-card-cover">
                {this.user?.cover && <img src={autoImageUrl(this.user?.cover?.url, 500)} />}
            </div><div className="shy-user-card-content">
                    <Avatar userid={this.user.id}></Avatar>
                </div></>}
        </div>
    }
    async open(options?: { user?: Partial<UserBasic> }) {
        this.user = options.user;
        this.forceUpdate()
    }
}

export async function useUserCard(pos: PopoverPosition, options?: { user?: Partial<UserBasic>, userid?: string }) {
    let popover = await PopoverSingleton(UserCard, { mask: true });
    let fv = await popover.open(pos);
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