import React from "react";
import { PopoverSingleton } from "../../../extensions/popover/popover";
import { PopoverPosition } from "../../../extensions/popover/position";
import { User } from "../../../src/types/user";
import { EventsComponent } from "../../lib/events.component";
import { Avatar } from "./face";

export class UserCard extends EventsComponent {
    user: User;
    render(): React.ReactNode {
        return <div className="shy-user-card">
            {this.user && <><div className="shy-user-card-cover">
                {this.user?.cover && <img src={this.user?.cover?.url} />}
            </div><div className="shy-user-card-content">
                    <Avatar icon={this.user.avatar} text={this.user.name}></Avatar>
                </div></>}
        </div>
    }
    async open(options?: { user?: Partial<User>, userid?: string }) {

    }
}

export async function useUserCard(pos: PopoverPosition, options?: { user?: Partial<User>, userid?: string }) {
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