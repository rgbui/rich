import { ReactNode } from "react";
import { channel } from "../net/channel";
import { EventsComponent } from "./lib/events.component";
import { PopoverPosition } from "../extensions/popover/position";
import { PopoverSingleton } from "../extensions/popover/popover";
import React from "react";
import { Avatar } from "./view/avator/face";
import { Button } from "./view/button";

export enum PayFeatureCheck {
    aiGPT = 'ai-gpt',
    aiImage = 'ai-image',
    upload = 'upload',
    dataGridRow = 'data-grid-row'
}


export async function canSupportFeature(check: PayFeatureCheck) {
    var r = await channel.get('/check/feature', { type: check });
    if (r.ok) {
        if (r.data.limit) {

            return false;
        }
        else if (r.data.warn) {
            return true;
        }
        else return true;
    }
}

export class PayTip extends EventsComponent {
    open(props: { check: PayFeatureCheck }) {
        var ws = channel.query('/current/workspace');
        var user = channel.query('/query/current/user');
        this.userid = user.id;
        this.owner = ws.owner || ws.creater;
        this.forceUpdate()
    }
    openPay() {

        channel.act('/open/pay');
        this.emit('close');
    }
    contactUser() {
        this.emit('close');
    }
    userid: string = '';
    owner: string = '';
    render(): ReactNode {
        return <div>
            <div className="warn-bg">该功能是诗云调用第三方付费接口，无法免费，需要充值才能继续使用</div>
            {this.userid == this.owner && <div className="flex">
                <div className="flex-center gap-h-10">联系空间拥有者<Avatar userid={this.owner}></Avatar>，让他充些值</div>
                <div className="flex-center"><Button onClick={e => this.contactUser()}>联系TA</Button></div>
            </div>}
            {this.userid == this.owner && <div>
                <div className="flex-center gap-h-10">您需要充值，才能继续使用该功能</div>
                <div className="flex-center"><Button onClick={e => this.openPay()}>充值</Button></div>
            </div>}
        </div>
    }
}


export async function usePayTip(props: { check: PayFeatureCheck }) {
    var pos: PopoverPosition = { center: true, centerTop: 100 };
    let popover = await PopoverSingleton(PayTip, { mask: true, shadow: true });
    let fv = await popover.open(pos);
    fv.open(props);
    return new Promise((resolve: (data: boolean) => void, reject) => {
        popover.only('close', () => {
            resolve(false);
        });
        fv.only('close', () => {
            popover.onClose()
        })
    })
}
