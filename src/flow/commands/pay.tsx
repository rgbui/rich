
import React from "react";
import { S } from "../../../i18n/view";
import { FlowCommand, FlowCommandView } from "../command";
import { flow, flowView } from "../factory/observable";
import { Icon } from "../../../component/view/icon";
import { Input } from "../../../component/view/input";
import { InputNumber } from "../../../component/view/input/number";
import { Textarea } from "../../../component/view/input/textarea";
import { useWsPayOrder } from "../../../extensions/pay/ws.order";

@flow('/pay')
export class ConfirmCommand extends FlowCommand {
    constructor() {
        super();
    }
    orderTitle: string = '';
    orderDetail: string = '';
    money: number = 0;
    count: number = 1;
    async get() {
        var json = await super.get();
        json.orderTitle = this.orderTitle;
        json.orderDetail = this.orderDetail;
        json.money = this.money;
        json.count = this.count;
        return json;
    }
    async clone() {
        var json = await super.clone();
        json.orderTitle = this.orderTitle;
        json.orderDetail = this.orderDetail;
        json.money = this.money;
        json.count = this.count;
        return json;
    }
    async excute() {
        var page = this.flow.buttonBlock.page;
        var r = await useWsPayOrder({
            order: {
                title: page.getFormExpress(this.orderTitle),
                detail: page.getFormExpress(this.orderDetail),
                money: page.getFormExpress(this.money as any) as any,
                count: page.getFormExpress(this.count as any) as any
            },
            ws: this.flow.buttonBlock.page.ws
        });
    }
}

@flowView('/pay')
export class ConfirmCommandView extends FlowCommandView<ConfirmCommand> {
    renderView() {
        return <div>
            {this.renderHead(
                <Icon size={16} icon={{ name: 'bytedance-icon', code: 'paper-money' }}></Icon>,
                <><S>支付</S></>
            )}
            <div className="r-gap-h-10">
                <div>
                    <div className="f-12 remark gap-b-3"><S>订单</S></div>
                    <Input value={this.command.orderTitle} onEnter={e => {
                        this.command.onUpdateProps({ orderTitle: e })
                    }} onChange={e => { this.command.onUpdateProps({ orderTitle: e }) }}></Input>
                </div>
                <div>
                    <div className="f-12 remark gap-b-3"><S>价钱</S></div>
                    <InputNumber filterValue={e => {
                        if (e && typeof e == 'string' && e.indexOf('{') > -1) return e;
                    }} value={this.command.money} onEnter={e => {
                        this.command.onUpdateProps({ money: e })
                    }} onChange={e => { this.command.onUpdateProps({ money: e }) }}></InputNumber>
                </div>
                <div>
                    <div className="f-12 remark gap-b-3"><S>数量</S></div>
                    <InputNumber filterValue={e => {
                        if (e && typeof e == 'string' && e.indexOf('{') > -1) return e;
                    }} value={this.command.count} onEnter={e => {
                        this.command.onUpdateProps({ count: e })
                    }} onChange={e => { this.command.onUpdateProps({ count: e }) }}></InputNumber>
                </div>
                <div>
                    <div className="f-12 remark gap-b-3"><S>备注</S></div>
                    <Textarea value={this.command.orderDetail} onEnter={e => {
                        this.command.onUpdateProps({ orderDetail: e })
                    }} onChange={e => { this.command.onUpdateProps({ orderDetail: e }) }}></Textarea>
                </div>
            </div>
        </div>
    }
}
