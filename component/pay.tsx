import { ReactNode } from "react";
import { channel } from "../net/channel";
import { EventsComponent } from "./lib/events.component";
import { PopoverPosition } from "../extensions/popover/position";
import { PopoverSingleton } from "../extensions/popover/popover";
import React from "react";
import { Avatar } from "./view/avator/face";
import { Button } from "./view/button";
import { Page } from "../src/page";
import { S } from "../i18n/view";

export enum PayFeatureCheck {
    aiGPT = 'ai-gpt',
    aiImage = 'ai-image',
    upload = 'upload',
    dataGridRow = 'data-grid-row'
}

export async function CanSupportFeature(check: PayFeatureCheck,page:Page) {
    var r = await channel.get('/check/feature', { type: check });
    if (r.ok) {
        if (r.data.limit) {
            await usePayTip({ check,page });
            return false;
        }
        else if (r.data.warn) {
            return true;
        }
        else return true;
    }
}

export class PayTip extends EventsComponent {
    open(props: { check: PayFeatureCheck,page:Page }) {
        var ws =props.page.ws;
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
        return <div className="round padding-14">
            <div className="warn-bg gap-h-10"><S key={'需充值才能使用'}>需充值才能使用(该功能为第三方收费接口，诗云无法免费）</S></div>
            {this.userid != this.owner && <div className="gap-h-10">
                <div className="flex-center gap-h-10"><S>联系空间拥有者</S><Avatar showCard userid={this.owner}></Avatar>,<S>让TA充值</S></div>
                <div className="flex-center gap-h-10"><Button ghost onClick={e => this.openPay()}><S>自已充钱体验</S></Button></div>
            </div>}
            {this.userid == this.owner && <div>
                <div className="flex-center gap-h-10"><S>您需要充值，才能继续使用该功能</S></div>
                <div className="flex-center gap-h-10"><Button onClick={e => this.openPay()}><S>充值</S></Button></div>
            </div>}
        </div>
    }
}


export async function usePayTip(props: { check: PayFeatureCheck ,page:Page}) {
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
