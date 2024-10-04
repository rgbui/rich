import React, { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { LinkWs } from "../../src/page/declare";
import { Divider } from "../../component/view/grid";
import { Button } from "../../component/view/button";
import { util } from "../../util/util";
import { ShyAlert } from "../../component/lib/alert";


export type WsPayOrderProps = {
    title: string,
    detail: string,
    money: number,
    count: number
}

export class WsPayOrder extends EventsComponent {
    ws: LinkWs;
    order: WsPayOrderProps = {
        title: '',
        detail: '',
        money: 0,
        count: 0
    };
    open(props: { order: WsPayOrderProps, ws: LinkWs }) {
        this.ws = props.ws;
        this.order = props.order;
        this.forceUpdate()
    }
    render() {
        
        return <div className="round padding-14 w-500">
            <div className="gap-h-10">
                <div className="h3">{this.order.title}</div>
                <div className="f-14 gap-h-1-">
                    {this.order.detail}
                </div>
            </div>

            <Divider></Divider>
            <div className="flex">
                <div className="flex-auto error">需要开通商用支付功能</div>
                <div className="flex-fixed">
                    <Button onMouseDown={e => {
                        ShyAlert('需要开通商用支付功能')
                    }} >支付{util.showPrice(this.order.money * this.order.count)}</Button>
                </div>
            </div>
        </div>
    }
}


export async function useWsPayOrder(props: { order: WsPayOrderProps, ws: LinkWs }) {
    var pos: PopoverPosition = { center: true, centerTop: 100 };
    let popover = await PopoverSingleton(WsPayOrder, { mask: true, shadow: true });
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
