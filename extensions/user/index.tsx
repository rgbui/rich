import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Remark } from "../../component/view/text";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";

export class UserPicker extends EventsComponent {
    render() {
        return <div className="shy-user-picker">
            <div className="shy-user-picker-input">
                <input type='text' />
            </div>
            <Remark>选择用户</Remark>
            <div className="shy-user-picker-users">

            </div>
        </div>
    }
    open() {

    }
    onChange() {

    }
}

export async function useUserPicker(pos: PopoverPosition, options?: {}) {
    let popover = await PopoverSingleton(UserPicker, { mask: true });
    let fv = await popover.open(pos);
    fv.open();
    return new Promise((resolve: (data: {
        text: string,
        url: string
    }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        popover.only('close', () => {
            resolve(null)
        });
    })
}