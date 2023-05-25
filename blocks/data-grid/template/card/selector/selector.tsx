
import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../../../../component/lib/events.component";
import { Button } from "../../../../../component/view/button";
import { Divider } from "../../../../../component/view/grid";
import { PopoverSingleton } from "../../../../../extensions/popover/popover";
import { PopoverPosition } from "../../../../../extensions/popover/position";
import { CardPropsType } from "../declare";
import { CardFactory } from "../factory/factory";
import { TableSchema } from "../../../schema/meta";

export class CardSelector extends EventsComponent {
    render(): ReactNode {
        return <div className="w-500 round ">
            <div className="flex padding-l-10 padding-b-14">
                {this.getStores().map(cs => {
                    return <div
                        className={"padding-t-14 padding-r-14 w-200  round cursor item-hover" + (this.selectUrl == cs.url ? " item-focus-hover" : "")}
                        onMouseDown={e => this.onSelect(cs, e)}
                        key={cs.url}>
                        <div className="gap-b-10"><img className="round-8" style={{ maxWidth: 120 }} src={cs.image} /></div>
                        <div className="text f-14">{cs.title}</div>
                        <div className="remark f-12">{cs.remark}</div>
                    </div>
                })}
            </div>
            <Divider></Divider>
            <div className="padding-w-14 flex-end  min-h-40">
                <Button onMouseDown={e => this.onSave()} className="gap-r-10">确定</Button>
                <Button ghost onMouseDown={e => this.onClose()}>取消</Button>
            </div>
        </div>
    }
    getStores() {
        return Array.from(CardFactory.CardModels.values())
    }
    selectUrl: string = '';
    schema: TableSchema = null;
    open(props?: { schema?: TableSchema, item?: { url?: string } }) {
        this.selectUrl = props?.item?.url || '';
        this.schema = props?.schema;
        this.forceUpdate()
    }
    onSelect(d: CardPropsType, event: React.MouseEvent) {
        this.selectUrl = d.url;
        this.current = d; 
        this.forceUpdate();
        this.emit('save', d)
    }
    onSave() {
        this.emit('save', this.current)
    }
    onClose() {
        this.emit('close');
    }
    current: CardPropsType;
}

export async function useCardSelector(pos: PopoverPosition, options?: { schema?: TableSchema, item?: { url?: string } }) {
    let popover = await PopoverSingleton(CardSelector, { mask: true });
    let cardSelector = await popover.open(pos);
    cardSelector.open(options);
    return new Promise((resolve: (data: CardPropsType) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        });
        cardSelector.only('close', d => {
            popover.close()
            resolve(null)
        })
        cardSelector.only('save', (d) => {
            popover.close()
            resolve(d)
        })
    })
}